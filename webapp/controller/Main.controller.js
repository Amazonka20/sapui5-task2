sap.ui.define(
  [
    "project2/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Text",
  ],
  (BaseController, JSONModel, Filter, FilterOperator, Dialog, Button, Text) => {
    "use strict";

    return BaseController.extend("project2.controller.Main", {
      onInit() {
        const aUniqueGenres = [
          ...new Set(this.oBookData.map((book) => book.Genre)),
        ];
        const aGenres = [
          { key: "", text: "All" },
          ...aUniqueGenres.map((g) => ({ key: g, text: g })),
        ];
        const aBooks = this.oBookData.map((b) => ({ ...b, editMode: false }));

        const oBookModel = new JSONModel({
          book: aBooks,
          genres: aGenres,
          selectedGenre: "",
          nameFilter: "",
        });

        this.getView().setModel(oBookModel, "books");
      },

      onAdd() {
        const oBookModel = this.getBookModel();
        const aBook = oBookModel.getProperty("/book") || [];

        const oEmprtyLine = {
          ID: "",
          Name: "",
          Author: "",
          Genre: "",
          ReleaseDate: null,
          AvailableQuantity: "",
          editMode: false,
        };

        oBookModel.setProperty("/book", [...aBook, oEmprtyLine]);
      },

      onDelete() {
        const oBundle = this.getView().getModel("i18n").getResourceBundle();

        if (!this._oDeleteDialog) {
          this._oDeleteDialog = new Dialog({
            title: oBundle.getText("confirmDialogTitle"),
            content: new Text({ text: oBundle.getText("confirmDialogText") }),
            beginButton: new Button({
              text: oBundle.getText("btnYes"),
              type: "Emphasized",
              press: () => {
                this._doDelete();
                this._oDeleteDialog.close();
              },
            }),
            endButton: new Button({
              text: oBundle.getText("btnNo"),
              press: () => this._oDeleteDialog.close(),
            }),
          });

          this.getView().addDependent(this._oDeleteDialog);
        }

        this._oDeleteDialog.open();
      },

      _doDelete() {
        const oBookModel = this.getBookModel();
        const aBook = oBookModel.getProperty("/book");

        const oTable = this.byId("booksTable");
        const aContext = oTable.getSelectedContexts(true);

        const aIndexes = aContext.map((context) =>
          Number(context.getPath().split("/").pop())
        );

        const aNewBook = aBook.filter((_, i) => !aIndexes.includes(i));
        oBookModel.setProperty("/book", aNewBook);
        oTable.removeSelections(true);
      },

      onFilterChange() {
        const oBookModel = this.getBookModel();
        const sNameFilter = oBookModel.getProperty("/nameFilter") || "";
        const sGenre = oBookModel.getProperty("/selectedGenre") || "";
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
        const oBookModel = this.getBookModel();
        const sPath = oCtx.getPath();
        const sEditMode = sPath + "/editMode";

        oBookModel.setProperty(sEditMode, !oBookModel.getProperty(sEditMode));
      },

      oBookData: [
        {
          ID: "B001",
          Name: "The Silent Harbor",
          Author: "Emily Stone",
          Genre: "Drama",
          ReleaseDate: new Date("2018-05-14"),
          AvailableQuantity: 12,
        },
        {
          ID: "B002",
          Name: "Code of the North",
          Author: "Liam Anders",
          Genre: "Technology",
          ReleaseDate: new Date("2021-09-01"),
          AvailableQuantity: 5,
        },
        {
          ID: "B007",
          Name: "Tech Patterns",
          Author: "Nina Petrova",
          Genre: "Technology",
          ReleaseDate: new Date("2020-06-10"),
          AvailableQuantity: 7,
        },
        {
          ID: "B003",
          Name: "Midnight Letters",
          Author: "Sofia Martinez",
          Genre: "Romance",
          ReleaseDate: new Date("2016-02-20"),
          AvailableQuantity: 0,
        },
        {
          ID: "B004",
          Name: "Quantum Basics",
          Author: "Dr. Alan Brooks",
          Genre: "Science",
          ReleaseDate: new Date("2019-11-11"),
          AvailableQuantity: 8,
        },
        {
          ID: "B005",
          Name: "Ashes of Empire",
          Author: "Victor Hale",
          Genre: "Fantasy",
          ReleaseDate: new Date("2014-07-30"),
          AvailableQuantity: 3,
        },
        {
          ID: "B006",
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
