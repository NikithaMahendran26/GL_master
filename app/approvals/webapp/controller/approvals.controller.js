// sap.ui.define([
//     "sap/ui/core/mvc/Controller"
// ], (Controller) => {
//     "use strict";

//     return Controller.extend("approvals.controller.approvals", {
//         onInit() {
//         }
//     });
// });
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, Fragment, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("approvals.controller.approvals", {

        onInit: function () {
            this.getView().setModel(new JSONModel({
                editable: true,
                title: "Create GL Account",
                closeText: "Cancel"
            }), "ui");

            this.getView().setModel(new JSONModel({}), "GLRequestModel");
        },

        onViewApproval: function () {
            this._openDialog(false, "View GL Account");
        },

        _openDialog: function (bEditable, sTitle) {
            const oUI = this.getView().getModel("ui");

            oUI.setProperty("/editable", bEditable);
            oUI.setProperty("/title", sTitle);
            oUI.setProperty("/closeText", bEditable ? "Cancel" : "Close");

            if (!this._glDialog) {
                Fragment.load({
                    name: "approvals.fragments.gldata",
                    controller: this
                }).then(oDialog => {
                    this._glDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    oDialog.open();
                });
            } else {
                this._glDialog.open();
            }
        },
         onCloseGL: function () {
            this._glDialog.close();
        }

    });
});
