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
        oDialog.getModel("record").setData(this._getEmptyRecord());

        oDialog.open();
      },

      onCloseDialog(oEvent) {
        const oDialog = oEvent.getSource().getParent();
        this._resetDialogValidation();
        oDialog.close();
      },

      onSaveDialog(oEvent) {
        if (!this._validateDialog()) {
          return;
        }
        const oTable = this._getBooksTable();
        const oListBinding = oTable.getBinding("items");
        const oPayload = this.oDialog.getModel("record").getData();
        const oNewContext = oListBinding.create(oPayload);

        oNewContext
          .created()
          .then(() => {
            MessageToast.show(this.getI18nText("msgCreateSuccess"));

            this.onCloseDialog(oEvent);
          })
          .catch(() => {
            MessageToast.show(this.getI18nText("msgCreateError"));
            this.onCloseDialog(oEvent);
          });
      },

      _validateDialog() {
        const oData = this.oDialog.getModel("record").getData();

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

          const oNewModel = new JSONModel(this._getEmptyRecord());
          this.oDialog.setModel(oNewModel, "record");
        }
        return this.oDialog;
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
