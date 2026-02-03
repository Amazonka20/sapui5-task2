sap.ui.define(
  [
    "project2/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "project2/utils/DialogValidator",
  ],
  (BaseController, JSONModel, MessageBox, MessageToast, DialogValidator) => {
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

      async onOpenAddDialog() {
        const oDialog = await this._getDialog();
        oDialog.getModel("record").setData(this._getEmptyRecord());
        this._resetDialogValidation();
        oDialog.open();
      },

      onSaveDialog(oEvent) {
        if (!this._validateDialog()) {
          return;
        }
        const oDialogData = oEvent
          .getSource()
          .getParent()
          .getModel("record")
          .getData();
        this.getModel("oDataV2").create("/Products", oDialogData, {
          success: () => {
            MessageToast.show(this.getI18nText("msgCreateSuccess"));
            this.oDialog.close();
          },
          error: () => {
            MessageBox.error(this.getI18nText("msgCreateError"));
          },
        });
        this.onCloseDialog(oEvent);
      },

      onCloseDialog(oEvent) {
        const oDialog = oEvent.getSource().getParent();
        oDialog.close();
      },

      _validateDialog() {
        return DialogValidator.validateDialog({
          data: this.oDialog.getModel("record").getData() || {},
          getI18nText: this.getI18nText.bind(this),
          fields: [
            {
              key: "Name",
              control: this.byId("inpRecordName"),
              required: true,
            },
            {
              key: "Description",
              control: this.byId("inpRecordDescription"),
              required: true,
            },
            {
              key: "ReleaseDate",
              control: this.byId("dpRecordReleaseDate"),
              required: true,
              type: "date",
            },
            {
              key: "DiscontinuedDate",
              control: this.byId("dpRecordDiscontinuedDate"),
              required: true,
              type: "date",
            },
            {
              key: "Rating",
              control: this.byId("inpRecordRating"),
              required: true,
            },
            {
              key: "Price",
              control: this.byId("inpRecordPrice"),
              required: true,
            },
          ],
        });
      },

      _resetDialogValidation() {
        DialogValidator.resetDialogValidation({
          controls: [
            this.byId("inpRecordName"),
            this.byId("inpRecordDescription"),
            this.byId("dpRecordReleaseDate"),
            this.byId("dpRecordDiscontinuedDate"),
            this.byId("inpRecordRating"),
            this.byId("inpRecordPrice"),
          ],
        });
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

      async _getDialog() {
        if (!this.oDialog) {
          this.oDialog = await this.loadFragment({
            name: "project2.view.RecordDialog",
          });

          const oTemp = new JSONModel(this._getEmptyRecord());
          this.oDialog.setModel(oTemp, "record");
        }
        return this.oDialog;
      },

      _getEmptyRecord() {
        return {
          Name: "",
          Description: "",
          ReleaseDate: null,
          DiscontinuedDate: null,
          Rating: "",
          Price: "",
        };
      },
    });
  }
);
