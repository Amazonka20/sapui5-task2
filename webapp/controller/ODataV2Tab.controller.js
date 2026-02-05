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
          bEditMode: false,
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
        this._oTransientContext = this.getModel("oDataV2").createEntry(
          "/Products",
          {
            properties: this._getEmptyRecord(),
          }
        );
        this.getModel("view").setProperty("/bEditMode", false);
        oDialog.setBindingContext(this._oTransientContext, "oDataV2");
        oDialog.open();
      },

      onSaveDialog(oEvent) {
        if (!this._validateDialog()) {
          return;
        }
        const bEditMode = this.getModel("view").getProperty("/bEditMode");

        this.getModel("oDataV2").submitChanges({
          success: () => {
            MessageToast.show(
              this.getI18nText(
                bEditMode ? "msgUpdateSuccess" : "msgCreateSuccess"
              )
            );
            this._resetDialogValidation();
            this.onCloseDialog(oEvent);
          },
          error: () => {
            MessageToast.show(
              this.getI18nText(bEditMode ? "msgUpdateError" : "msgCreateError")
            );
            this._resetDialogValidation();
            this.onCloseDialog(oEvent);
          },
        });
      },

      onCloseDialog(oEvent) {
        const oDialog = oEvent.getSource().getParent();
        const sContextPath = oDialog.getBindingContext("oDataV2").getPath();
        const bEditMode = this.getModel("view").getProperty("/bEditMode");

        this._resetDialogValidation();
        if (bEditMode) {
          this.getModel("oDataV2").resetChanges([sContextPath]);
        } else this._oTransientContext?.delete();
        oDialog.close();
      },

      async onEdit(oEvent) {
        const oDialog = await this._getDialog();
        const oDialogContext = oEvent.getSource().getBindingContext("oDataV2");
        oDialog.setBindingContext(oDialogContext, "oDataV2");

        this.getModel("view").setProperty("/bEditMode", true);
        oDialog.open();
      },

      _validateDialog() {
        const oData = this.oDialog.getBindingContext("oDataV2").getObject();

        return DialogValidator.validateDialog({
          data: oData,
          getI18nText: this.getI18nText.bind(this),
          fields: [
            {
              key: "Name",
              control: this.byId("inpNameV2"),
              required: true,
            },
            {
              key: "Description",
              control: this.byId("inpDescriptionV2"),
              required: true,
            },
            {
              key: "ReleaseDate",
              control: this.byId("dpReleaseDateV2"),
              required: true,
              type: "date",
            },
            {
              key: "DiscontinuedDate",
              control: this.byId("dpDiscontinuedDateV2"),
              required: false,
              type: "date",
            },
            {
              key: "Rating",
              control: this.byId("inpRatingV2"),
              required: true,
            },
            {
              key: "Price",
              control: this.byId("inpPriceV2"),
              required: true,
            },
          ],
        });
      },

      _resetDialogValidation() {
        DialogValidator.resetDialogValidation({
          controls: [
            this.byId("inpNameV2"),
            this.byId("inpDescriptionV2"),
            this.byId("dpReleaseDateV2"),
            this.byId("dpDiscontinuedDateV2"),
            this.byId("inpRatingV2"),
            this.byId("inpPriceV2"),
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
            name: "project2.fragments.ODataV2Dialog",
          });
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
