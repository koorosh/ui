import React from "react";
import * as protos from "@cockroachlabs/crdb-protobuf-client";
import classNames from "classnames/bind";

import { makeStatementsColumns } from "../statementsTable";
import {
  SortedTable,
  ISortedTablePagination,
  SortSetting,
} from "../sortedtable";
import { Pagination } from "../pagination";
import { TransactionsPageStatistic } from "../transactionsPage/transactionsPageStatistic";
import { baseHeadingClasses } from "../transactionsPage/transactionsPageClasses";
import { Button } from "../button";
import { collectStatementsText } from "src/transactionsPage/utils";
import { tableClasses } from "../transactionsTable/transactionsTableClasses";
import { BackIcon } from "../icon";
import { SqlBox } from "../sql";
import { aggregateStatements } from "../transactionsPage/utils";
import Long from "long";
import { Loading } from "../loading";
import { SummaryCard } from "../summaryCard";
import { Bytes, Duration, formatNumberForDisplay } from "src/util";

import summaryCardStyles from "../summaryCard/summaryCard.module.scss";

const { containerClass } = tableClasses;

type Statement = protos.cockroach.server.serverpb.StatementsResponse.ICollectedStatementStatistics;
type TransactionStats = protos.cockroach.sql.ITransactionStatistics;

const summaryCardStylesCx = classNames.bind(summaryCardStyles);

interface TransactionDetailsProps {
  statements?: Statement[];
  transactionStats?: TransactionStats;
  lastReset?: string | Date;
  handleDetails: (
    statementIds: Long[] | null,
    transactionStats: TransactionStats | null,
  ) => void;
  error?: Error | null;
}

interface TState {
  sortSetting: SortSetting;
  pagination: ISortedTablePagination;
}

export class TransactionDetails extends React.Component<
  TransactionDetailsProps,
  TState
> {
  state: TState = {
    sortSetting: {
      sortKey: 2,
      ascending: false,
    },
    pagination: {
      pageSize: 10,
      current: 1,
    },
  };

  onChangeSortSetting = (ss: SortSetting) => {
    this.setState({
      sortSetting: ss,
    });
  };

  onChangePage = (current: number) => {
    const { pagination } = this.state;
    this.setState({ pagination: { ...pagination, current } });
  };

  render() {
    const { statements, transactionStats, handleDetails, error } = this.props;
    return (
      <div>
        <section className={baseHeadingClasses.wrapper}>
          <Button
            onClick={() => handleDetails(null, null)}
            type="unstyled-link"
            size="small"
            icon={BackIcon}
            iconPosition="left"
          >
            All transactions
          </Button>
          <h1 className={baseHeadingClasses.tableName}>Transaction Details</h1>
        </section>
        <Loading
          error={error}
          loading={!statements || !transactionStats}
          render={() => {
            const { statements, transactionStats, lastReset } = this.props;
            const { sortSetting, pagination } = this.state;
            const statementsSummary = collectStatementsText(statements);
            const aggregatedStatements = aggregateStatements(statements);
            const duration = (v: number) => Duration(v * 1e9);
            return (
              <React.Fragment>
                <section className={containerClass}>
                  <SqlBox value={statementsSummary} />
                  <TransactionsPageStatistic
                    pagination={pagination}
                    totalCount={statements.length}
                    lastReset={lastReset}
                    arrayItemName={"statements for this transaction"}
                    activeFilters={0}
                  />
                  <SummaryCard>
                    <div className={summaryCardStylesCx("summary--card__item")}>
                      <h3
                        className={summaryCardStylesCx(
                          "summary--card__item--label",
                        )}
                      >
                        Mean transaction time
                      </h3>
                      <p
                        className={summaryCardStylesCx(
                          "summary--card__item--value",
                        )}
                      >
                        {formatNumberForDisplay(
                          transactionStats.service_lat.mean,
                          duration,
                        )}
                      </p>
                    </div>
                    <p
                      className={summaryCardStylesCx("summary--card__divider")}
                    />
                    <div>
                      <h3>Transaction resource usage</h3>
                    </div>
                    <div className={summaryCardStylesCx("summary--card__item")}>
                      <h4
                        className={summaryCardStylesCx(
                          "summary--card__item--label",
                        )}
                      >
                        Mean rows/bytes read
                      </h4>
                      <p
                        className={summaryCardStylesCx(
                          "summary--card__item--value",
                        )}
                      >
                        {formatNumberForDisplay(
                          transactionStats.rows_read.mean,
                        )}
                        {" / "}
                        {formatNumberForDisplay(
                          transactionStats.bytes_read.mean,
                          Bytes,
                        )}
                      </p>
                    </div>
                    <div className={summaryCardStylesCx("summary--card__item")}>
                      <h4
                        className={summaryCardStylesCx(
                          "summary--card__item--label",
                        )}
                      >
                        Max memory usage
                      </h4>
                      <p
                        className={summaryCardStylesCx(
                          "summary--card__item--value",
                        )}
                      >
                        {formatNumberForDisplay(
                          transactionStats.exec_stats.max_mem_usage.mean,
                          Bytes,
                        )}
                      </p>
                    </div>
                    <div className={summaryCardStylesCx("summary--card__item")}>
                      <h4
                        className={summaryCardStylesCx(
                          "summary--card__item--label",
                        )}
                      >
                        Bytes read over network
                      </h4>
                      <p
                        className={summaryCardStylesCx(
                          "summary--card__item--value",
                        )}
                      >
                        {formatNumberForDisplay(
                          transactionStats.exec_stats.network_bytes.mean,
                          Bytes,
                        )}
                      </p>
                    </div>
                    {/* TODO(asubiotto): Add temporary disk usage */}
                  </SummaryCard>
                  <SortedTable
                    data={aggregatedStatements}
                    columns={makeStatementsColumns(
                      aggregatedStatements,
                      "",
                      "",
                    )}
                    className="statements-table"
                    sortSetting={sortSetting}
                    onChangeSortSetting={this.onChangeSortSetting}
                  />
                </section>
                <Pagination
                  pageSize={pagination.pageSize}
                  current={pagination.current}
                  total={statements.length}
                  onChange={this.onChangePage}
                />
              </React.Fragment>
            );
          }}
        />
      </div>
    );
  }
}
