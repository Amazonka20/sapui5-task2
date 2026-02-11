sap.ui.define(
  [
    "project2/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  (BaseController, JSONModel, MessageBox, MessageToast) => {
    "use strict";

    return BaseController.extend("project2.controller.ODataV4Tab", {
      onInit() {
        const UIModel = new JSONModel({
          bCanDelete: false,
        });
        this.getView().setModel(UIModel, "view");
      },

      onSelectionChange() {
        const oTable = this._getBooksTable();
        const bCanDelete = oTable.getSelectedContexts(true).length > 0;
        this.getModel("view").setProperty("/bCanDelete", bCanDelete);
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

      _doDelete() {
        const oTable = this._getBooksTable();
        const aContexts = oTable.getSelectedContexts(true);
        const iDeletedRecords = aContexts.length;

        Promise.all(aContexts.map((oContext) => oContext.delete()))
          .then(() => {
            MessageToast.show(
              this.getI18nText("msgDeleteSuccess", [iDeletedRecords])
            );
            this._resetSelection(oTable);
          })
          .catch(() => {
            MessageToast.show(
              this.getI18nText("msgDeleteError", [iDeletedRecords])
            );
            this._resetSelection(oTable);
          });
      },

      _resetSelection(oTable) {
        oTable.removeSelections(true);
        this.getModel("view").setProperty("/bCanDelete", false);
      },

      _getBooksTable() {
        return this.byId("booksTableV4");
      },
    });
  }
);
