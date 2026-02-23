sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/Token",
    "sap/ui/model/FilterType",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    // "com/mdg/service/servicemaster/model/formatter"
], (Controller, Fragment, FilterOperator, Filter, Token, FilterType, MessageBox, JSONModel, Spreadsheet,formatter) => {
    "use strict";

    return Controller.extend("glmaster.controller.Overview", {
        // formatter: formatter,
        onInit: function () {
            let that = this;
            this.oBundle = this.getOwnerComponent().getModel('i18n').getResourceBundle();
            //this.getOwnerComponent().busyDialog.close();
            var globalModel = this.getOwnerComponent().getModel('mainServiceModel');
            this.getView().setModel(globalModel);
            var maxL = this.getView().byId("maxL").getValue();
            if (maxL == 0) {
                maxL = 50;
            }
            //globalModel.setSizeLimit(maxL);

            this._oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            // this._myDelegate = {
            //     "onAfterRendering": function (oEvent) {
            //         let currUser = sap.ushell.Container.getService("UserInfo")?.getEmail()?.toLowerCase();
            //         if (currUser && currUser !== '') {
            //             this.byId("crBy").addToken(new sap.m.Token({
            //                 text: currUser
            //             }));
            //             oEvent?.srcControl?.fireSearch();
            //         }
            //     }
            // };
            // this.byId("filterbar").addEventDelegate(this._myDelegate, this);
        },
        onDefaultAction: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Create", {
                type: "C",
                key: "C"
            });

        },
        
        navTo: function (view) {
            this.getOwnerComponent().getRouter().navTo(view);
        },

        onDisplay: function () {
            this.getOwnerComponent().getRouter().navTo("Change");
        },

        onCreate: function () {
            this.navTo("Create");
        }
    });
});