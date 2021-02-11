import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import {
  StatementDetails,
  StatementDetails_20_2,
  StatementDetailsDispatchProps,
  StatementDetailsProps,
  StatementDetailsStateProps,
} from "./statementDetails";
import { AppState } from "../store";
import { selectStatement } from "./statementDetails.selectors";
import { nodeDisplayNameByIDSelector } from "../store/nodes";
import { actions as statementActions } from "src/store/statements";
import {
  actions as statementDiagnosticsActions,
  selectDiagnosticsReportsByStatementFingerprint,
} from "src/store/statementDiagnostics";
import { actions as analyticsActions } from "src/store/analytics";
import { actions as localStorageActions } from "src/store/localStorage";
import { actions as nodesActions } from "../store/nodes";
import { actions as nodeLivenessActions } from "../store/liveness";

const mapStateToProps = (
  state: AppState,
  props: StatementDetailsProps,
): StatementDetailsStateProps => {
  const statement = selectStatement(state, props);
  const statementFingerprint = statement?.statement;
  return {
    statement,
    statementsError: state.adminUI.statements.lastError,
    nodeNames: nodeDisplayNameByIDSelector(state),
    diagnosticsReports: selectDiagnosticsReportsByStatementFingerprint(
      state,
      statementFingerprint,
    ),
  };
};

const mapDispatchToProps: StatementDetailsDispatchProps = {
  refreshStatements: statementActions.refresh,
  refreshStatementDiagnosticsRequests: statementDiagnosticsActions.refresh,
  refreshNodes: nodesActions.refresh,
  refreshNodesLiveness: nodeLivenessActions.refresh,
  dismissStatementDiagnosticsAlertMessage: () =>
    localStorageActions.update({
      key: "adminUi/showDiagnosticsModal",
      value: false,
    }),
  createStatementDiagnosticsReport: statementDiagnosticsActions.createReport,
  onTabChanged: tabName =>
    analyticsActions.subNavigationSelection({
      page: "statementDetails",
      value: tabName,
    }),
  onDiagnosticBundleDownload: statementFingerprint =>
    analyticsActions.downloadStatementDiagnostics({
      page: "statementDetails",
      value: statementFingerprint,
    }),
};

export const ConnectedStatementDetailsPage = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(StatementDetails),
);

export const ConnectedStatementDetailsPage_20_2 = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(StatementDetails_20_2),
);
