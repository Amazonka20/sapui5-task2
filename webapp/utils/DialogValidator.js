sap.ui.define(["sap/ui/core/library"], function (CoreLibrary) {
  "use strict";
  const { ValueState } = CoreLibrary;

  function validateDialog(oParams) {
    const oData = oParams.data || {};
    const aFields = oParams.fields || [];
    const fnGetI18nText = oParams.getI18nText;
    let bIsValid = true;

    const fnSetError = function (oControl, sText) {
      oControl.setValueState(ValueState.Error);
      oControl.setValueStateText(sText);
      bIsValid = false;
    };

    const fnClearError = function (oControl) {
      oControl.setValueState(ValueState.None);
      oControl.setValueStateText("");
    };

    aFields.forEach(function (oField) {
      const vValue = oData[oField.key];

      if (oField.required && !String(vValue ?? "").trim()) {
        fnSetError(oField.control, fnGetI18nText("errRequired"));
        return;
      }
      fnClearError(oField.control);

      if (oField.type === "date") {
        const oSelectedDate = oField.control.getDateValue();
        if (oSelectedDate) {
          const oToday = new Date();
          oToday.setHours(0, 0, 0, 0);

          const oPickedDate = new Date(oSelectedDate);
          oPickedDate.setHours(0, 0, 0, 0);

          if (oPickedDate > oToday) {
            fnSetError(oField.control, fnGetI18nText("errDateNotFuture"));
          }
        }
      }
    });

    return bIsValid;
  }
  function resetDialogValidation(oParams) {
    const aControls = oParams.controls || [];

    aControls.forEach(function (oControl) {
      if (!oControl) return;

      oControl.setValueState(ValueState.None);
      if (oControl.setValueStateText) {
        oControl.setValueStateText("");
      }
    });
  }

  return {
    validateDialog: validateDialog,
    resetDialogValidation: resetDialogValidation,
  };
});
