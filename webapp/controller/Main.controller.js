sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("project2.controller.Main", {
      onInit() {
        const oBookModel = new JSONModel({ book: this.oBookData });

        this.getView().setModel(oBookModel, "books");
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
