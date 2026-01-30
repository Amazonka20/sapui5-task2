sap.ui.define(
  [
    "project2/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState",
  ],
  (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    ValueState
  ) => {
    "use strict";

    return BaseController.extend("project2.controller.Main", {
      onInit() {
        const aUniqueGenres = [
          ...new Set(this.oBookData.map((book) => book.Genre)),
        ];
        const aGenres = [
          { key: "", text: "All" },
          ...aUniqueGenres.map((sGenre) => ({ key: sGenre, text: sGenre })),
        ];
        const aBooks = this.oBookData.map((book) => ({
          ...book,
          editMode: false,
        }));

        const oBookModel = new JSONModel({
          book: aBooks,
        });

        const oUIModel = new JSONModel({
          genres: aGenres,
          selectedGenre: "",
          nameFilter: "",
          canDelete: false,
        });

        this.getView().setModel(oBookModel, "books");
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

      _doDelete() {
        const oBookModel = this.getModel("books");
        const aBook = oBookModel.getProperty("/book");

        const oTable = this.byId("booksTable");
        const aContext = oTable.getSelectedContexts(true);

        const aIndexes = aContext.map((context) =>
          Number(context.getPath().split("/").pop())
        );

        const aNewBook = aBook.filter((_, i) => !aIndexes.includes(i));
        oBookModel.setProperty("/book", aNewBook);
        oTable.removeSelections(true);
        this.getModel("view").setProperty("/canDelete", false);
      },

      onSelectionChange() {
        const oTable = this.byId("booksTable");
        const bCanDelete = oTable.getSelectedContexts(true).length > 0;
        this.getModel("view").setProperty("/canDelete", bCanDelete);
      },

      onFilterChange() {
        const oViewModel = this.getModel("view");
        const sNameFilter = oViewModel.getProperty("/nameFilter") || "";
        const sGenre = oViewModel.getProperty("/selectedGenre") || "";
        const filters = [];

        if (sNameFilter) {
          filters.push(
            new Filter("Name", FilterOperator.Contains, sNameFilter)
          );
        }

        if (sGenre) {
          filters.push(new Filter("Genre", FilterOperator.EQ, sGenre));
        }

        const oTable = this.byId("booksTable");
        const oBinding = oTable.getBinding("items");
        oBinding.filter(filters);
      },

      onToggleEdit(oEvent) {
        const oCtx = oEvent.getSource().getBindingContext("books");
        const oBookModel = this.getModel("books");
        const sPath = oCtx.getPath();
        const sEditMode = sPath + "/editMode";

        oBookModel.setProperty(sEditMode, !oBookModel.getProperty(sEditMode));
      },

      async onOpenAddDialog() {
        const oDialog = await this._getDialog();
        const oNewBookModel = new JSONModel(this._createEmptyBook());
        oDialog.setModel(oNewBookModel, "newBook");

        this._resetDialogValidation();
        oDialog.open();
      },

      onSaveDialog(oEvent) {
        if (!this._validateDialog()) {
          return;
        }
        const oDialog = oEvent.getSource().getParent();
        const oNewBookModel = oDialog.getModel("newBook");
        const oNew = oNewBookModel.getData();

        const oBookModel = this.getModel("books");
        const aBooks = oBookModel.getProperty("/book") || [];
        oBookModel.setProperty("/book", [...aBooks, oNew]);
        this.onCloseDialog(oEvent);
      },

      onCloseDialog(oEvent) {
        const oDialog = oEvent.getSource().getParent();
        this._resetDialogValidation();
        oDialog.close();
      },

      _validateDialog() {
        const oNewBook = this.oDialog.getModel("newBook").getData() || {};

        const oNameInput = this.byId("inpName");
        const oAuthorInput = this.byId("inpAuthor");
        const oGenreInput = this.byId("inpGenre");
        const oQuantityInput = this.byId("inpQty");
        const oReleaseDatePicker = this.byId("dpReleaseDate");

        let bIsValid = true;

        const fnSetError = (oControl, sText) => {
          oControl.setValueState(ValueState.Error);
          oControl.setValueStateText(sText);
          bIsValid = false;
        };

        const fnClearError = (oControl) => {
          oControl.setValueState(ValueState.None);
          oControl.setValueStateText("");
        };

        const aRequiredChecks = [
          { sKey: "Name", oControl: oNameInput },
          { sKey: "Author", oControl: oAuthorInput },
          { sKey: "Genre", oControl: oGenreInput },
          { sKey: "ReleaseDate", oControl: oReleaseDatePicker },
          { sKey: "AvailableQuantity", oControl: oQuantityInput },
        ];

        aRequiredChecks.forEach(({ sKey, oControl }) => {
          if (!String(oNewBook[sKey] ?? "").trim()) {
            fnSetError(oControl, this.getI18nText("errRequired"));
          } else {
            fnClearError(oControl);
          }
        });

        const oSelectedDate = oReleaseDatePicker.getDateValue();

        if (oSelectedDate) {
          const oToday = new Date();
          oToday.setHours(0, 0, 0, 0);

          const oPickedDate = new Date(oSelectedDate);
          oPickedDate.setHours(0, 0, 0, 0);

          if (oPickedDate > oToday) {
            fnSetError(
              oReleaseDatePicker,
              this.getI18nText("errDateNotFuture")
            );
          } else {
            fnClearError(oReleaseDatePicker);
          }
        }

        return bIsValid;
      },

      _resetDialogValidation() {
        const aControlIds = [
          "inpName",
          "inpAuthor",
          "inpGenre",
          "inpQty",
          "dpReleaseDate",
        ];

        aControlIds.forEach((sId) => {
          const oCtrl = this.byId(sId);
          if (!oCtrl) return;

          oCtrl.setValueState(ValueState.None);
          if (oCtrl.setValueStateText) oCtrl.setValueStateText("");
        });
      },

      async _getDialog() {
        this.oDialog ??= await this.loadFragment({
          name: "project2.view.Dialog",
        });
        return this.oDialog;
      },

      _createEmptyBook() {
        return {
          Name: "",
          Author: "",
          Genre: "",
          ReleaseDate: null,
          AvailableQuantity: "",
          editMode: false,
        };
      },

      oBookData: [
        {
          Name: "The Silent Harbor",
          Author: "Emily Stone",
          Genre: "Drama",
          ReleaseDate: new Date("2018-05-14"),
          AvailableQuantity: 12,
        },
        {
          Name: "Code of the North",
          Author: "Liam Anders",
          Genre: "Technology",
          ReleaseDate: new Date("2021-09-01"),
          AvailableQuantity: 5,
        },
        {
          Name: "Tech Patterns",
          Author: "Nina Petrova",
          Genre: "Technology",
          ReleaseDate: new Date("2020-06-10"),
          AvailableQuantity: 7,
        },
        {
          Name: "Midnight Letters",
          Author: "Sofia Martinez",
          Genre: "Romance",
          ReleaseDate: new Date("2016-02-20"),
          AvailableQuantity: 0,
        },
        {
          Name: "Quantum Basics",
          Author: "Dr. Alan Brooks",
          Genre: "Science",
          ReleaseDate: new Date("2019-11-11"),
          AvailableQuantity: 8,
        },
        {
          Name: "Ashes of Empire",
          Author: "Victor Hale",
          Genre: "Fantasy",
          ReleaseDate: new Date("2014-07-30"),
          AvailableQuantity: 3,
        },
        {
          Name: "Thinking in Systems",
          Author: "Laura Chen",
          Genre: "Non-fiction",
          ReleaseDate: new Date("2022-03-18"),
          AvailableQuantity: 15,
        },
      ],
    });
  }
);
