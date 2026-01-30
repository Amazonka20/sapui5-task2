sap.ui.define([], () => {
  "use strict";

  return {
    publishedYear(oDate) {
      if (!oDate) {
        return "";
      }
      const dateObject = oDate instanceof Date ? oDate : new Date(oDate);

      return this.getI18nText("publishedPrefix", [dateObject.getFullYear()]);
    },
  };
});
