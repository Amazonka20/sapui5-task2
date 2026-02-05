sap.ui.define(
  [
    "project2/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "project2/model/formatter",
    "project2/utils/DialogValidator",
  ],
  (
    BaseController,
    JSONModel,
    Filter,
    FilterOperator,
    MessageBox,
    formatter,
    DialogValidator
  ) => {
    "use strict";

    return BaseController.extend("project2.controller.JsonTab", {
      formatter: formatter,
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
        oDialog.getModel("newBook").setData(this._getEmptyBook());
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
        return DialogValidator.validateDialog({
          data: this.oDialog.getModel("newBook").getData() || {},
          getI18nText: this.getI18nText.bind(this),
          fields: [
            { key: "Name", control: this.byId("inpName"), required: true },
            { key: "Author", control: this.byId("inpAuthor"), required: true },
            { key: "Genre", control: this.byId("inpGenre"), required: true },
            {
              key: "ReleaseDate",
              control: this.byId("dpReleaseDate"),
              required: true,
              type: "date",
            },
            {
              key: "AvailableQuantity",
              control: this.byId("inpQty"),
              required: true,
            },
          ],
        });
      },

      _resetDialogValidation() {
        DialogValidator.resetDialogValidation({
          controls: [
            this.byId("inpName"),
            this.byId("inpAuthor"),
            this.byId("inpGenre"),
            this.byId("inpQty"),
            this.byId("dpReleaseDate"),
          ],
        });
      },

      async _getDialog() {
        if (!this.oDialog) {
          this.oDialog = await this.loadFragment({
            name: "project2.fragments.Dialog",
          });

          const oNewBookModel = new JSONModel(this._getEmptyBook());
          this.oDialog.setModel(oNewBookModel, "newBook");
        }
        return this.oDialog;
      },

      _getEmptyBook() {
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
