sap.ui.define(
  [
    "project2/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  (BaseController, JSONModel, MessageBox, MessageToast) => {
    "use strict";

    return BaseController.extend("project2.controller.ODataV2Tab", {
      onInit() {
        const oUIModel = new JSONModel({
          canDelete: false,
        });

        this.getView().setModel(oUIModel, "view");
      },

      onDelete() {
        MessageBox.confirm(this.getI18nText("confirmDialogText"), {
          title: this.getI18nText("confirmDialogTitle"),
          actions: [MessageBox.Action.YES, MessageBox.Action.NO],
          emphasizedAction: MessageBox.Action.YES,
          onClose: (sAction) => {
            if (sAction === MessageBox.Action.YES) {
              this._doDelete();
            }
          },
          dependentOn: this.getView(),
        });
      },

      onSelectionChange() {
        const oTable = this.byId("booksTableV2");
        const bCanDelete = oTable.getSelectedContexts(true).length > 0;
        this.getModel("view").setProperty("/canDelete", bCanDelete);
      },

      _doDelete() {
        const oTable = this.byId("booksTableV2");
        const aContexts = oTable.getSelectedContexts(true);
        const oModel = this.getModel("oDataV2");
        const iDeletedRecords = aContexts.length;

        aContexts.forEach((oContext) => {
          oContext.delete();
        });
        oModel.submitChanges({
          success: () => {
            MessageToast.show(
              this.getI18nText("msgDeleteSuccess", [iDeletedRecords])
            );
            this._resetSelection(oTable);
          },
          error: () => {
            MessageToast.show(
              this.getI18nText("msgDeleteError", [iDeletedRecords])
            );
            this._resetSelection(oTable);
          },
        });
      },

      _resetSelection(oTable) {
        oTable.removeSelections(true);
        this.getModel("view").setProperty("/canDelete", false);
      },
    });
  }
);
