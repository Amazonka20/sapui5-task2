sap.ui.define(
  [
    "project2/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "project2/utils/DialogValidator",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
  ],
  (
    BaseController,
    JSONModel,
    MessageBox,
    MessageToast,
    DialogValidator,
    Filter,
    FilterOperator,
    Sorter
  ) => {
    "use strict";

    return BaseController.extend("project2.controller.ODataV2Tab", {
      onInit() {
        const oUIModel = new JSONModel({
          canDelete: false,
          bEditMode: false,
          sFilter: "",
          selectedColumn: "All",
          columns: [
            { key: "All", text: this.getI18nText("genreAll") },
            { key: "Name", text: this.getI18nText("colName") },
            { key: "Description", text: this.getI18nText("colDescription") },
            { key: "ReleaseDate", text: this.getI18nText("colReleaseDate") },
            {
              key: "DiscontinuedDate",
              text: this.getI18nText("colDiscontinuedDate"),
            },
            { key: "Rating", text: this.getI18nText("colRating") },
            { key: "Price", text: this.getI18nText("colPrice") },
          ],
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
          },
          error: () => {
            MessageToast.show(
              this.getI18nText(bEditMode ? "msgUpdateError" : "msgCreateError")
            );
            this._resetDialogValidation();
          },
        });

        this.onCloseDialog(oEvent);
      },

      onCloseDialog(oEvent) {
        const oDialog = oEvent.getSource().getParent();
        this.getModel("oDataV2").resetChanges();
        this._resetDialogValidation();
        this.getModel("view").setProperty("/ediMode", false);
        oDialog.close();
      },

      async onEdit(oEvent) {
        const oDialog = await this._getDialog();
        const oDialogContext = oEvent.getSource().getBindingContext("oDataV2");
        oDialog.setBindingContext(oDialogContext, "oDataV2");

        this.getModel("view").setProperty("/bEditMode", true);
        oDialog.open();
      },

      onFilterLiveChange() {
        const sQuery = this.getModel("view").getProperty("/sFilter");

        clearTimeout(this._filterTimer);
        this._filterTimer = setTimeout(() => {
          const oTable = this.byId("booksTableV2");
          const oBinding = oTable.getBinding("items");
          const oFilter = new Filter("Name", FilterOperator.Contains, sQuery);

          oBinding.filter([oFilter]);
        }, 400);
      },

      onSortChange() {
        const sSelectedColumn =
          this.getModel("view").getProperty("/selectedColumn");
        const oTable = this.byId("booksTableV2");
        const oBinding = oTable.getBinding("items");

        const oSorter = new Sorter(sSelectedColumn, true);
        oBinding.sort([oSorter]);
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
            name: "project2.view.RecordDialog",
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
