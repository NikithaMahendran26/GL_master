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

        // 
        onInit: function () {
           // this.getRouter().initialize();
            var oComments = new JSONModel();
            var aComments = [];
            oComments.setData(aComments);
            //this.getOwnerComponent().busyDialog.close();
            //this.getOwnerComponent().setModel(oComments, "commentModel");
            //  if (this.getOwnerComponent().getModel("task").getProperty("/TaskDefinitionName").search("Approval") >= 0) {
            //     this.byId("editbtn").setVisible(false);;
            // }
            // else {
            //     this.byId("viewbtn").setVisible(true);;
            // }
        },

        onViewApproval: function () {
    if (!this._selectedGL) {
        MessageToast.show("Please select a GL record");
        return;
    }

    // Set model for fragment
    const oModel = new JSONModel(this._selectedGL);
    this.getView().setModel(oModel, "GLRequestModel");

    this._openDialog(false, "View GL Account");
},
        _openDialog: async function (bEditable, sTitle) {
    const oUI = this.getView().getModel("ui");

    oUI.setProperty("/editable", bEditable);
    oUI.setProperty("/title", sTitle);
    oUI.setProperty("/closeText", bEditable ? "Cancel" : "Close");

    if (!this._glDialog) {
        this._glDialog = await Fragment.load({
            id: this.getView().getId(),   
            name: "approvals.fragments.gldata",
            controller: this
        });
    }

    this._glDialog.open();
},

        onSelectionChange: function (oEvent) {
    const oItem = oEvent.getParameter("listItem");
    const hasSelection = !!oItem;

    this.byId("viewbtn").setEnabled(hasSelection);
    this.byId("changeLogBtn").setEnabled(hasSelection);

    if (hasSelection) {
        this._selectedGL = oItem.getBindingContext("glModel").getObject();
    }
},

        onCommentPost: function (oEvent) {
    const text = oEvent.getParameter("value");
    if (!text) return;

    const user =
        sap.ushell?.Container?.getUser?.().getEmail() || "approver@dummy";

    this.getOwnerComponent().addApproverComment(text, user);

    oEvent.getSource().setValue("");
},

         onCloseGL: function () {
            this._glDialog.close();
        }

    });
});
