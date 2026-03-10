sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("glmaster.controller.Change", {

        onInit: function () {

    var oModel = this.getOwnerComponent().getModel("glDetailsModel");
    this.getView().setModel(oModel, "glDetailsModel");

    const oRouter = sap.ui.core.UIComponent.getRouterFor(this);

    oRouter.getRoute("Change")
        .attachPatternMatched(this._onRouteMatched, this);
},

_onRouteMatched: function () {

    var oTable = this.byId("glDetailsTable");
    var oBinding = oTable.getBinding("items");

    if (oBinding) {

        var aFilters = [];

        
        aFilters.push(new Filter("ChartOfAccounts", FilterOperator.EQ, "INT"));

        oBinding.filter(aFilters);

    }


},
        onSearch: function () {

    var aFilters = [];

    // mandatory filter
    aFilters.push(new Filter("ChartOfAccounts", FilterOperator.EQ, "INT"));

    var sGL = this.byId("idGLAccount").getValue();
    var sCompany = this.byId("idCompanyCode").getValue();
    var sCreatedBy = this.byId("idCreatedBy").getValue();

    if (sGL) {
        aFilters.push(new Filter("GLAccount", FilterOperator.Contains, sGL));
    }

    if (sCompany) {
        aFilters.push(new Filter("CompanyCode", FilterOperator.Contains, sCompany));
    }

    if (sCreatedBy) {
        aFilters.push(new Filter("NameofPersonwhoCreatedObject", FilterOperator.Contains, sCreatedBy));
    }

    var oTable = this.byId("glDetailsTable");
    var oBinding = oTable.getBinding("items");

    if (oBinding) {
        oBinding.filter(aFilters);
    }

}


    });
});
