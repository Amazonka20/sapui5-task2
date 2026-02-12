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

      async onOpenAddDialog() {
        const oDialog = await this._getDialog();
        const oListBinding = this.getModel("oDataV4").bindList(
          "/Products",
          null,
          null,
          null,
          { $$updateGroupId: "changes" }
        );
        const oNewContext = oListBinding.create(this._getEmptyRecord());
        oNewContext.created().catch((oError) => {
          if (this._isRequestCanceled(oError)) {
            return;
          }
          console.error(oError);
        });

        oDialog.setBindingContext(oNewContext, "oDataV4");
        oDialog.open();
      },

      onCloseDialog(oEvent) {
        const oDialog = oEvent.getSource().getParent();
        const oContext = oDialog.getBindingContext("oDataV4");

        if (oContext && oContext.isTransient()) {
          oContext.delete();
        }

        this._resetDialogValidation();
        oDialog.close();
      },

      async onSaveDialog(oEvent) {
        if (!this._validateDialog()) {
          return;
        }

        const oTableBinding = this._getBooksTable().getBinding("items");
        const oModel = this.getModel("oDataV4");
        const oContext = this.oDialog.getBindingContext("oDataV4");

        try {
          oModel.submitBatch("changes");
          await oContext.created();

          MessageToast.show(this.getI18nText("msgCreateSuccess"));
          oTableBinding.refresh();

          this.onCloseDialog(oEvent);
        } catch (oError) {
          if (this._isRequestCanceled(oError)) {
            return;
          }
          MessageToast.show(this.getI18nText("msgCreateError"));
        }
      },

      _validateDialog() {
        const oData = this.oDialog.getBindingContext("oDataV4").getObject();

        return DialogValidator.validateDialog({
          data: oData,
          getI18nText: this.getI18nText.bind(this),
          fields: [
            {
              key: "Name",
              control: this.byId("inpNameV4"),
              required: true,
            },
            {
              key: "Description",
              control: this.byId("inpDescriptionV4"),
              required: true,
            },
            {
              key: "ReleaseDate",
              control: this.byId("dpReleaseDateV4"),
              required: true,
              type: "date",
            },
            {
              key: "DiscontinuedDate",
              control: this.byId("dpDiscontinuedDateV4"),
              required: false,
              type: "date",
            },
            {
              key: "Rating",
              control: this.byId("inpRatingV4"),
              required: true,
            },
            {
              key: "Price",
              control: this.byId("inpPriceV4"),
              required: true,
            },
          ],
        });
      },

      _resetDialogValidation() {
        DialogValidator.resetDialogValidation({
          controls: [
            this.byId("inpNameV4"),
            this.byId("inpDescriptionV4"),
            this.byId("dpReleaseDateV4"),
            this.byId("dpDiscontinuedDateV4"),
            this.byId("inpRatingV4"),
            this.byId("inpPriceV4"),
          ],
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

      async _getDialog() {
        if (!this.oDialog) {
          this.oDialog = await this.loadFragment({
            name: "project2.fragments.ODataV4Dialog",
          });
        }
        return this.oDialog;
      },

      _isRequestCanceled(oError) {
        return Boolean(oError && oError.canceled === true);
      },

      _getEmptyRecord() {
        return {
          Name: "",
          Description: "",
          ReleaseDate: null,
          DiscontinuedDate: null,
          Rating: 0,
          Price: 0,
        };
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
