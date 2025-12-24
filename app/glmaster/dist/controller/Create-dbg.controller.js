sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
        "sap/ui/core/format/DateFormat",
    "sap/m/MessageBox",
        "sap/m/MessageToast",
        "sap/ui/core/Fragment",
        "sap/ui/model/FilterType",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/Filter"
    ],
    function (Controller, JSONModel, DateFormat, MessageBox, MessageToast, Fragment, FilterType, FilterOperator, Filter) {
    "use strict";

        return Controller.extend(
            "glmaster.controller.Create",
            {
                onInit: function () {
                    this.i18n = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                    var oComments = new JSONModel();
                    var aComments = [];
                    oComments.setData(aComments);
                    this.getOwnerComponent().setModel(oComments, "commentModel");

                    var oRouter = this.getOwnerComponent().getRouter();
                    oRouter.getRoute("Create").attachPatternMatched(this.onEntry, this);
                    //oRouter.getRoute("Change").attachPatternMatched(this.onEntry, this);
                    // oRouter.getRoute("extendRoute").attachPatternMatched(this.onEntry, this);
                    // oRouter.getRoute("deleteRoute").attachPatternMatched(this.onEntry, this);
                    this.logonLanguage = sap.ui.getCore().getConfiguration().getLanguage().toUpperCase();
                    //this.getOwnerComponent().busyDialog.close();
                    //   let exclmodel = new JSONModel(sap.ui.require.toUrl('com/deloitte/asset/mdg/srv/create/model/ExcelTemplate.json'));
                    //   this.getView().setModel(exclmodel, "MulExclTemplate"); 
                    this._oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                    this.getView().setModel(new JSONModel({
                        GLCollection: []
                    }), "glModel");
                    this.getView().setModel(new JSONModel({
                        messagesLength: 0,
                        messages: []
                    }), "GLMessageModel");

                },

                navBack: function () {
                    var that = this;

                    var sText = "Unsaved data will be lost. Do you want to continue?";

                    MessageBox.warning(sText, {
                        title: "Confirm",
                        styleClass: "",
                        actions: [
                            "Yes", MessageBox.Action.CANCEL
                        ],
                        emphasizedAction: "Yes",        // default
                        onClose: function (sAction) {
                            if (sAction === "Yes") {
                                that.onNavBack();
                            }
                        }
                    });
                },
                onNavBack: function(){
                    this.getOwnerComponent().getRouter().navTo("RouteOverview");
        },
                onEntry: function (oEvent) {
                    // Gets route name and route arguments
                    let routeName = oEvent.getParameter("name");
                    let routeArguments = oEvent.getParameter("arguments");
                    this.initModels(routeName);
                    if (routeName === "Change") {
                        let service = routeArguments.sServiceNumber;
                        this.updateServiceRequestModel(service);
                    }
                },
                initModels: function (routeName) {
                    // Sets Resource Bundle
                    this._oBundle = this.getView().getModel("i18n").getResourceBundle();
                    this.createCommentModel();
                    this.createWFModel();
                    this.materialCollectionModelReset(routeName);
                    // this.createMessageModel();

                    // Create other models
                    this.getView().setModel(new JSONModel({}), "GLRequestModel");

                    // Create JSON Model for Excel Column Config
                    // var oModel = new JSONModel(sap.ui.require.toUrl("materialmaster/model/excelHdr.json"));
                    // let appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                    // let appPath = appId.replaceAll(".", "/");
                    // let sExcelHdrPath = `${jQuery.sap.getModulePath(appPath)}/model/excelHdr.json`;
                    // let oExcelHdr = new JSONModel(sExcelHdrPath);
                    // this.getView().setModel(oExcelHdr, "excelHdr");
                    this.isDisplayonly = routeName;
                },
                createCommentModel: function () {
                    var oComments = new JSONModel();
                    var aComments = [];
                    oComments.setData(aComments);

                    // Set Model to Owner Component
                    this.getOwnerComponent().setModel(oComments, "commentModel");
                },
                materialCollectionModelReset: function (routeName) {
                    let requestType = "";
                    switch (routeName) {
                        case "Create":
                            requestType = "Create";
                            break;
                        case "Change":
                            requestType = "Change";
                            break;
                        // case "extendRoute":
                        //     requestType = "Extend";
                        //     break;
                        // case "deleteRoute":
                        //     requestType = "Delete";
                        //     break;
                        // case "viewRoute":

                        //     break;
                        default:
                            break;
                    }
                    var oData = {
                        RequestId: "",
                        RequestType: requestType,
                        WorkflowInstanceId: "",
                        GLCollection: []
                    };
                    this.getView().setModel(new JSONModel(oData), "glModel");
                    this.getView().getModel("glModel").refresh(true);
                },

                getGLObject: function () {
                    return {
                        GLAccount: "",
                        CompanyCode: "",
                        GLAccountType: "",
                        AccountGroup: "",
                        ShortText: "",
                        LongText: "",
                        AccountCurrency: "",
                        LocalCurrencyOnly: false,
                        TaxCategory: "",
                        PostingWithoutTax: false,
                        ReconciliationAccount: false,
                        OpenItemManagement: false,
                        SortKey: "",
                        FieldStatusGroup: "",
                        PostAutomatically: false,
                        CashFlowRelevant: false,
                        HouseBank: "",
                        AccountID: ""
                    };
                },

                createGLRequestModel: function (oView, logonLanguage) {
                    let objService = this.getGLObject(logonLanguage);
                    let oModel = new JSONModel(objService);
                    oView.setModel(oModel, "GLRequestModel");
                },
                createServiceMessageModel: function (oView) {
                    let oModel = new JSONModel({
                        messagesLength: 0,
                        messages: []
                    });
                    oView.setModel(oModel, "ServiceMessageModel");
                },
                onSelectionChange: function (oEvent) {
                    let blEnabled = false;
                    let oSelectedItem = this.byId("srvTable").getSelectedItem();

                    if (oSelectedItem) {
                        blEnabled = true;
                    }


                    this.byId("btndele").setEnabled(blEnabled);
                    this.byId("btnedit").setEnabled(blEnabled);

                },
        deleteObj: function () {
                    var oSelectedItem = this.byId("srvTable").getSelectedItem();

                    if (oSelectedItem) {
                        var oMatModel = this.getView().getModel("serviceModel");
                        var oMatModelData = oMatModel.getData();
                        var oTable = this.byId("srvTable");
                        var that = this;
                        MessageBox.show(
                            this._oBundle.getText("del_confirm"), {
                            icon: MessageBox.Icon.INFORMATION,
                            title: this._oBundle.getText("del_confirm_title"),
                            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                            emphasizedAction: MessageBox.Action.YES,
                            onClose: function (oAction) {
                                if (oAction == "YES") {
                                    let sPath = oSelectedItem.getBindingContext("serviceModel").getPath();
                                    let deleteIndex = sPath.replace("/ServiceCollection/", "");
                                    oMatModel.getProperty("/ServiceCollection").splice(deleteIndex, 1);
                                    oMatModel.refresh(true);
                                    oTable.removeSelections(true);
                                    that.byId("btndele").setEnabled(false);
                                    that.byId("btnedit").setEnabled(false);
                                }
                            }
                        });
                    }
                    else {
                        MessageBox.information("Please select the record !")
                    }
        },

                onAddNew: function () {
                    this._mode = "A";

                    this.getView().setModel(
                        new JSONModel(this.getGLObject()),
                        "GLRequestModel"
                    );

                    this.openGLDialog("Add");
                },

                editObj: function () {
                    let oItem = this.byId("srvTable").getSelectedItem();
                    if (!oItem) {
                        MessageBox.information("Please select a record");
                        return;
                    }

                    this._mode = "E";
                    this._editPath = oItem.getBindingContext("glModel").getPath();

                    let oData = JSON.parse(JSON.stringify(
                        oItem.getBindingContext("glModel").getObject()
                    ));

                    this.getView().setModel(new JSONModel(oData), "GLRequestModel");
                    this.openGLDialog("Edit");
                },

                displayDialog: function (viewType) {
                    //this.getOwnerComponent().busyDialog.open();

                    let dialogTitle = viewType + " General Ledger Details";

                    // Checks Service item selected for view type - View, Edit
                    var oSelectedItem = this.byId("srvTable").getSelectedItem();
                    if (viewType === "View" || viewType === "Edit") {
                        if (oSelectedItem) {
                            var oBindingContext = oSelectedItem.getBindingContext("serviceModel");
                            this._editServicePath = oBindingContext.getPath();

                            let objService = JSON.parse(JSON.stringify(oBindingContext.getObject()));
                            this.getView().getModel("GLRequestModel").setData(objService);
                            this.getView().getModel("GLRequestModel").refresh(true);


                        } else {
                            MessageBox.information("Please select the record !")
                            this.getOwnerComponent().busyDialog.close();
                            return;
                        }
                    }

                    if (!this._ServiceObject) {
                        this._ServiceObject = this.loadFragment({
                            name: "glmaster.fragments.Gldialog"
                        });
                    }

                    // Displays Service dialog
                    this._ServiceObject.then((oDialog) => {
                        this.getView().addDependent(oDialog);
                        // this.clearServiceUIValueState();
                        this.createServiceMessageModel(this.getView());
                        this.updateGLUIFields(viewType);
                        oDialog.setTitle(dialogTitle);
                        oDialog.open();
                        this.getOwnerComponent().busyDialog.close();
                    });

                },
                openGLDialog: function (mode) {
                    if (!this._oGLDialog) {
                        this._oGLDialog = Fragment.load({
                            name: "glmaster.fragments.Gldialog",
                            controller: this
                        });
                    }

                    this._oGLDialog.then(oDialog => {
                        this.getView().addDependent(oDialog);
                        oDialog.setTitle(mode + " GL Account");
                        oDialog.open();
                    });
                },

                updateGLUIFields: function (viewType) {

                    let requestType = this.getView().getModel("glModel").getProperty("/RequestType");
                    let bEditable = false;
                    let bVisible = false;

                    if (viewType === "Add" || viewType === "Edit") {
                        bEditable = true;
                        bVisible = true;
                    }

                    // Initial
                    this.byId("inpGLAccount")?.setEditable(bEditable);
                    this.byId("inpCompanyCode")?.setEditable(bEditable);

                    // Type / Description
                    this.byId("inpGLType")?.setEditable(bEditable);
                    this.byId("inpAccGroup")?.setEditable(bEditable);
                    this.byId("inpShortText")?.setEditable(bEditable);
                    this.byId("txtLongText")?.setEditable(bEditable);

                    // Control Data
                    this.byId("inpCurrency")?.setEditable(bEditable);
                    this.byId("chkLocalCurrencyOnly")?.setEnabled(bEditable);
                    this.byId("inpTaxCategory")?.setEditable(bEditable);
                    this.byId("chkPostingWithoutTax")?.setEnabled(bEditable);
                    this.byId("chkReconciliation")?.setEnabled(bEditable);
                    this.byId("chkOpenItem")?.setEnabled(bEditable);
                    this.byId("inpSortKey")?.setEditable(bEditable);

                    // Create / Bank / Interest
                    this.byId("inpFieldStatus")?.setEditable(bEditable);
                    this.byId("chkPostAutomatically")?.setEnabled(bEditable);
                    this.byId("chkCashFlow")?.setEnabled(bEditable);
                    this.byId("inpHouseBank")?.setEditable(bEditable);
                    this.byId("inpAccountId")?.setEditable(bEditable);
                },

                cancelService: function () {
                    this._oGLDialog.then(oDialog => oDialog.close());
                },

                validateInputSuggestionField: function (oData, section, ctrl, propValue) {
                    let oEntry = {},
                        fieldKey = ctrl?.data("i18nFieldKey"),
                        required = ctrl?.getRequired();

                    if (ctrl)
                        if (ctrl.getValue() === "" && propValue === "" && required === true) {
                            oEntry.type = "Error";
                            oEntry.title = this._oBundle.getText("field_mandt", [this._oBundle.getText(fieldKey)]);
                            oEntry.description = this._oBundle.getText("field_mandt_desc", [this._oBundle.getText(fieldKey), this._oBundle.getText(section)]);

                            ctrl.setValueState("Error");
                            ctrl.setValueStateText(oEntry.title);

                            oData.messages.push(oEntry);
                        } else if (ctrl.getValue() !== "" && propValue === "") {
                            oEntry.type = "Error";
                            oEntry.title = this._oBundle.getText("field_invalid", [this._oBundle.getText(fieldKey)]);
                            oEntry.description = this._oBundle.getText("field_invalid_desc", [this._oBundle.getText(fieldKey), this._oBundle.getText(section)]);

                            ctrl.setValueState("Error");
                            ctrl.setValueStateText(oEntry.title);

                            oData.messages.push(oEntry);
                        } else {
                            ctrl.setValueState("None");
                            ctrl.setValueStateText();
                        }

                    return oData;
                },


                validateGLFrag: function () {
                    let oData = { messages: [] };
                    let oModel = this.getView().getModel("GLRequestModel");

                    const aFields = [
                        { id: "inpGLAccount", path: "/GLAccount", section: "Initial" },
                        { id: "inpCompanyCode", path: "/CompanyCode", section: "Initial" },
                        { id: "inpGLType", path: "/GLAccountType", section: "Type / Description" },
                        { id: "inpAccGroup", path: "/AccountGroup", section: "Type / Description" }
                    ];

                    aFields.forEach(f => {
                        let ctrl = this.byId(f.id);
                        let val = oModel.getProperty(f.path);
                        this.validateInputSuggestionField(oData, f.section, ctrl, val);
                    });

                    this.getView().getModel("GLMessageModel").setData(oData);

                    if (oData.messages.length > 0) {
                        this.byId("bMsgRecEditService").setType("Reject");
                        return false;
                    }
                    //this.byId("bMsgRecEditService").setType("Default");
                    return true;
                },


                submitsrv: function () {
                    if (!this.validateGLFrag()) return;

                    let oGLModel = this.getView().getModel("glModel");
                    let aData = oGLModel.getProperty("/GLCollection");

                    let oPayload = JSON.parse(JSON.stringify(
                        this.getView().getModel("GLRequestModel").getData()
                    ));

                    if (this._mode === "A") {
                        aData.push(oPayload);
                    } else {
                        Object.assign(oGLModel.getProperty(this._editPath), oPayload);
                    }

                    oGLModel.refresh(true);
                    this.cancelService();
                },


                createWFModel: function () {
                    this.getView().setModel(new JSONModel({
                        initialContext: JSON.stringify({ someProperty: "some value" }, null, 4),
                        apiResponse: "",
                    }), "workflowModel");
                },
                onCommentPost: function (oEvent) {
                    var oFormat = DateFormat.getDateTimeInstance({ style: "medium" });
                    var oComments = this.getView().getModel("commentModel");
                    var oDate = new Date();
                    var sDate = oFormat.format(oDate);
                    // create new entry
                    var sValue = oEvent.getParameter("value");
                    var aComments = oComments.getData();
                    var oEntry = {
                        UserName: this.getOwnerComponent().currentUser,
                        Date: "" + sDate,
                        Text: sValue,
                    };
                    aComments.unshift(oEntry);
                    oComments.setData(aComments);
                },
                getComments: function () {
                    let comments = this.getView().getModel("commentModel").getData();
                    if (comments.length <= 0) {
                        return MessageToast.show("Comments are mandatory!");
                    }

                    const currentUser = this.getOwnerComponent().currentUser || "defaultUser";
                    let finalComments = [];

                    comments.forEach(comment => {
                        finalComments.push({
                            "Comment": comment.Text,
                            "UserName": currentUser
                        });
                    });

                    return finalComments;
                },
                // initiateApprovalProcess: async function () {
                //     try {
                //         if (!this._oBusyDialog) {
                //             this._oBusyDialog = new sap.m.BusyDialog({ text: "Initiating approval process..." });
                //         }
                //         this._oBusyDialog.open();

                //         // Ensure mandatory comments are provided
                //         let commentModel = this.getView().getModel("commentModel");
                //         let comments = commentModel.getData();
                //         if (comments.length === 0) {
                //             this._oBusyDialog.close();
                //             MessageBox.information("Comments are mandatory!");
                //             return;
                //         }

                //         // Post data to generate Request ID
                //         this._oBusyDialog.setText("Posting data...");
                //         let reqID = await this.postData();
                //         if (!reqID) throw new Error("Failed to generate Request ID.");

                //         // Initiate workflow instance with the generated Request ID
                //         this._oBusyDialog.setText("Starting workflow...");
                //         let workflowSuccess = await this.startWorkflowInstance(reqID);
                //         if (!workflowSuccess) throw new Error("Failed to initiate workflow.");

                //         // Update backend with the workflow instance ID
                //         this._oBusyDialog.setText("Updating workflow header...");
                //         let workflowData = this.getView().getModel("workflowModel").getData();
                //         let workflowInstanceId = workflowData.apiResponse.id;
                //         await this.updateWorkflowHeader(reqID, workflowInstanceId);

                //         // Close BusyDialog and show success message
                //         this._oBusyDialog.close();
                //         this.showSuccessMessage(reqID);

                //     } catch (error) {
                //         // Handle errors gracefully
                //         if (this._oBusyDialog) {
                //             this._oBusyDialog.close();
                //         }
                //         MessageBox.error(error.message || "An error occurred during the process.");
                //         console.error("Error:", error);
                //     }
                // },
                generateRequestId: async function () {
                    try {
                        if (!this._oBusyDialog) {
                            this._oBusyDialog = new sap.m.BusyDialog({ text: "Creating request..." });
                        }
                        this._oBusyDialog.open();

                        const glItems = this.getView().getModel("glModel").getProperty("/GLCollection");
                        if (!glItems || glItems.length === 0) {
                            this._oBusyDialog.close();
                            MessageBox.information("Please add at least one GL record");
                            return;
                        }

                        const reqID = await this.postData();
                        if (!reqID) {
                            throw new Error("Request ID not generated");
                        }
                        this._oBusyDialog.setText("Starting workflow...");
                        let workflowSuccess = await this.startWorkflowInstance(reqID);
                        if (!workflowSuccess) throw new Error("Failed to initiate workflow.");

                        // Update backend with the workflow instance ID
                        this._oBusyDialog.setText("Updating workflow header...");
                        let workflowData = this.getView().getModel("workflowModel").getData();
                        let workflowInstanceId = workflowData.apiResponse.id;
                        await this.updateWorkflowHeader(reqID, workflowInstanceId);

                        // Close BusyDialog and show success message
                        this._oBusyDialog.close();
                        this.showSuccessMessage(reqID);

                    } catch (error) {
                        // Handle errors gracefully
                        if (this._oBusyDialog) {
                            this._oBusyDialog.close();
                        }
                        MessageBox.error(error.message || "An error occurred during the process.");
                        console.error("Error:", error);
                    }
                },

                    
                PayloadData: function () {
                    const glModel = this.getView().getModel("glModel");
                    const glItems = glModel.getProperty("/GLCollection");

                    const oData = {
                        workflowStatus: "In Approval",
                        type: this.getView().getModel("glModel").getProperty("/RequestType"),
                        glMasterItems: []  
                    };

                    glItems.forEach(item => {

                        if (!item.GLAccount || !item.CompanyCode) {
                            throw new Error("GL Account and Company Code are mandatory");
                        }

                        oData.glMasterItems.push({
                            GLAccount: item.GLAccount,
                            CompanyCode: item.CompanyCode,
                            GLAccountType: item.GLAccountType,
                            AccountGroup: item.AccountGroup,
                            ShortText: item.ShortText,
                            GLAccountLongText: item.GLAccountLongText,
                            AccountCurrency: item.AccountCurrency,
                            LocalCurrencyOnly: !!item.LocalCurrencyOnly,
                            PostingWithoutTax: !!item.PostingWithoutTax,
                            ReconciliationAccount: item.ReconciliationAccount,
                            OpenItemManagement: !!item.OpenItemManagement,
                            SortKey: item.SortKey,
                            FieldStatusGroup: item.FieldStatusGroup,
                            PostAutomatically: !!item.PostAutomatically,
                            CashFlowRelevant: !!item.CashFlowRelevant,
                            HouseBank: item.HouseBank,
                            AccountID: item.AccountID
                        });
                    });

                    return oData;
                },
                postData: function () {
                    let that = this;

                    return new Promise((resolve, reject) => {

                        let payload = that.PayloadData();
                        let oModel = that.getView().getModel("mainServiceModel");

                        oModel.create("/GlMasterRequests", payload, {
                            success: function (data) {
                                resolve(data.requestId);   
                            },
                            error: function (oError) {
                                reject(oError);
                            }
                        });
                    });
                },
                startWorkflowInstance: function (reqID) {
                    return new Promise((resolve, reject) => {
                        let definitionId = "eu10.btp-innovation-lab-s64t0r2h.glworfklow.gLProcess";
                        let commentModel = this.getView().getModel("commentModel");
                        let comments = commentModel.getData();

                        let initialContext = {
                            reqid: reqID,
                            Type: "Create",
                            Comment: comments
                        };

                        let url = this.getBaseURL() + "/workflow-instances";

                        $.ajax({
                            url: url,
                            method: "POST",
                            contentType: "application/json",
                            data: JSON.stringify({
                                definitionId: definitionId,
                                context: initialContext
                            }),
                            success: function (result) {
                                let workflowModel = this.getView().getModel("workflowModel");
                                workflowModel.setData({ apiResponse: result });
                                resolve(true);
                            }.bind(this),
                            error: function (error) {
                                console.error("Workflow start failed:", error);
                                reject(error);
                            }
                        });
                    });
                },
                updateWorkflowHeader: function (reqID, workflowInstanceId) {
                    return new Promise((resolve, reject) => {
                        let payload = {};
                        payload.workflowInstanceId = workflowInstanceId;

                        let model = this.getView().getModel("mainServiceModel");

                        model.update(`/GlMasterRequests('${reqID}')`, payload, {
                            success: function () {
                                resolve();
                            },
                            error: function (error) {
                                reject(error);
                            }
                        });
                    });
                },

                getBaseURL: function () {
                    let appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
                    let appPath = appId.replaceAll(".", "/");
                    return jQuery.sap.getModulePath(appPath) + "/bpmworkflowruntime/v1";
                },

                tokenRefresh: function () {
                    let token;
                    let url = this.getBaseURL() + "/xsrf-token";

                    $.ajax({
                        url: url,
                        method: "GET",
                        async: false,
                        headers: { "X-CSRF-Token": "Fetch" },
                        success: function (_, __, xhr) {
                            token = xhr.getResponseHeader("X-CSRF-Token");
                        },
                        error: function () {
                            console.error("Failed to fetch CSRF token.");
                        }
                    });
                    return token;
                },
                showSuccessMessage: function (reqID) {
                    var that = this;
                    MessageBox.success("Workflow initiated successfully for Request ID: " + reqID, {
                        onClose: function () {
                            var oView = that.getView();
                            var oFeedInput = oView.byId("fIC");
                            if (oFeedInput) {
                                oFeedInput.setValue("");
                            }
                            var oCommentList = oView.byId("flist");
                            if (oCommentList) {
                                var oCommentModel = oCommentList.getModel("commentModel");
                                if (oCommentModel) {
                                    oCommentModel.setData([]);
                                    oCommentModel.updateBindings(true);
                                }
                            }
                            var osrvTable = oView.byId("srvTable");
                            if (osrvTable) {
                                var osrvModel = osrvTable.getModel("glModel");
                                if (osrvModel) {
                                    osrvModel.setData({ GLCollection: [] });
                                    osrvModel.updateBindings(true);
                                }
                            }
                            var oRouter = that.getOwnerComponent().getRouter();
                            oRouter.navTo("RouteOverview");
                        }
                    });
                },
                getF4Data: function (model, entityset, oFilters) {
                    return new Promise((resolve, reject) => {
                        model.read(entityset, {
                            filters: oFilters,
                            success: data => resolve(data),
                            error: err => reject(err)
                        });
                    });
                },

                openF4Dialog: function (F4Title, formattedData, inputId) {
                    this.inputId = inputId;
                    if (!this.F4Dialog) {
                        // Only load the fragment once
                        Fragment.load({
                            id: this.getView().getId(),
                            name: "com.mdg.service.servicemaster.fragments.F4Dialog"
                        }).then(oDialog => {
                            this.F4Dialog = oDialog;
                            let view = this.getView();
                            view.addDependent(oDialog);
                            const oModel = new sap.ui.model.json.JSONModel(formattedData);
                            view.setModel(oModel, "F4Model");

                            oDialog.setTitle(F4Title);

                            // Attach event handlers
                            oDialog.attachSearch(this._handleValueHelpSearch, this);
                            oDialog.attachLiveChange(this._handleValueHelpSearch, this);
                            oDialog.attachConfirm(this._handleValueHelpClose, this);
                            oDialog.attachCancel(this._handleValueHelpClose, this);

                            oDialog.open();
                        }).catch(err => {
                            MessageBox.error("Failed to load F4 dialog: " + err.message);
                        });
                    } else {
                        // Reuse the existing dialog
                        const oModel = new sap.ui.model.json.JSONModel(formattedData);
                        this.getView().setModel(oModel, "F4Model");
                        this.F4Dialog.setTitle(F4Title);

                        // Attach event handlers again in case the dialog was reused
                        this.F4Dialog.attachSearch(this._handleValueHelpSearch, this);
                        this.F4Dialog.attachLiveChange(this._handleValueHelpSearch, this);
                        this.F4Dialog.attachConfirm(this._handleValueHelpClose, this);
                        this.F4Dialog.attachCancel(this._handleValueHelpClose, this);

                        this.F4Dialog.open();
                    }

                },
                _handleValueHelpSearch: function (oEvent) {
                    var sValue = oEvent.getParameter("value");
                    var oFilter = new sap.ui.model.Filter({
                        filters: [
                            new sap.ui.model.Filter("title", sap.ui.model.FilterOperator.Contains, sValue),
                            new sap.ui.model.Filter("description", sap.ui.model.FilterOperator.Contains, sValue)
                        ],
                        and: false
                    });

                    // Apply the filter to the model
                    var oBinding = oEvent.getSource().getBinding("items");
                    oBinding.filter(oFilter);
                },
                _handleValueHelpClose: function (oEvent) {
                    let oSelectedItem = oEvent.getParameter("selectedItem");
                    if (!oSelectedItem) {
                        return;
                    }

                    let inputField = this.getView().byId(this.inputId);
                    if (inputField) {
                        inputField.setValue(oSelectedItem.getTitle());
                    }


                },
                onValueHelpRequestUOM: function (oEvent) {
                    let model = this.getOwnerComponent().getModel("masterServiceModel"),
                        entityset = "/ZI_BASEUOM",
                        filters = [new sap.ui.model.Filter("language", sap.ui.model.FilterOperator.EQ, "EN")];
                    this.getF4Data(model, entityset, filters).then(data => {
                        let formattedData = [];
                        data?.results.forEach(item => {
                            formattedData.push({
                                "title": item.weightUnit,
                                "description": item.weightUnitText
                            });
                        });
                        this.openF4Dialog("Unit Of Measure", formattedData, oEvent.getSource().getId());
                    }).catch(err => {
                        MessageBox.error("Failed to load data for Unit Of Measure: " + err.message);
                    });
                },
                onValueHelpRequestMatGrp: function (oEvent) {
                    let model = this.getOwnerComponent().getModel("masterServiceModel"),
                        entityset = "/I_MaterialGroup"
                    this.getF4Data(model, entityset).then(data => {
                        let formattedData = [];
                        data?.results.forEach(item => {
                            formattedData.push({
                                "title": item.MaterialGroup,
                                "description": item.MaterialGroup_Text
                            });
                        });
                        this.openF4Dialog("Material Group", formattedData, oEvent.getSource().getId());
                    }).catch(err => {
                        MessageBox.error("Failed to load data for Material Group: " + err.message);
                    });
                },
                onValueHelpRequestDivision: function (oEvent) {
                    let model = this.getOwnerComponent().getModel("masterServiceModel"),
                        entityset = "/ZI_DIVISION",
                        filters = [new sap.ui.model.Filter("LANGUAGE", sap.ui.model.FilterOperator.EQ, "EN")];
                    this.getF4Data(model, entityset, filters).then(data => {
                        let formattedData = [];
                        data?.results.forEach(item => {
                            formattedData.push({
                                "title": item.DIVISION,
                                "description": item.NAME
                            });
                        });
                        this.openF4Dialog("Division", formattedData, oEvent.getSource().getId());
                    }).catch(err => {
                        MessageBox.error("Failed to load data for Division: " + err.message);
                    });
                },
                onValueHelpRequestValClass: function (oEvent) {
                    let model = this.getOwnerComponent().getModel("masterServiceModel"),
                        entityset = "/I_Prodvaluationclasstxt",
                        filters = [new sap.ui.model.Filter("Language", sap.ui.model.FilterOperator.EQ, "EN")];
                    this.getF4Data(model, entityset, filters).then(data => {
                        let formattedData = [];
                        data?.results.forEach(item => {
                            formattedData.push({
                                "title": item.ValuationClass,
                                "description": item.ValuationClassDescription
                            });
                        });
                        this.openF4Dialog("Valuation Class", formattedData, oEvent.getSource().getId());
                    }).catch(err => {
                        MessageBox.error("Failed to load data for Valuation Class: " + err.message);
                    });
                },
                onValueHelpRequestFormula: function (oEvent) {
                    let model = this.getOwnerComponent().getModel("masterServiceModel"),
                        entityset = "/ZI_FORMULANO",
                        filters = [new sap.ui.model.Filter("LANGUAGE", sap.ui.model.FilterOperator.EQ, "EN")];
                    this.getF4Data(model, entityset, filters).then(data => {
                        let formattedData = [];
                        data?.results.forEach(item => {
                            formattedData.push({
                                "title": item.FormulaNumber,
                                "description": item.DESCRIPTION
                            });
                        });
                        this.openF4Dialog("Formula", formattedData, oEvent.getSource().getId());
                    }).catch(err => {
                        MessageBox.error("Failed to load data for Formula: " + err.message);
                    });
                },
                onValueHelpRequestTaxTraiffCode: function (oEvent) {
                    let model = this.getOwnerComponent().getModel("masterServiceModel"),
                        entityset = "/I_AE_CNSMPNTAXCTRLCODETXT",
                        filters = [new sap.ui.model.Filter("Language", sap.ui.model.FilterOperator.EQ, "EN")];
                    this.getF4Data(model, entityset, filters).then(data => {
                        let formattedData = [];
                        data?.results.forEach(item => {
                            formattedData.push({
                                "title": item.ConsumptionTaxCtrlCode,
                                "description": item.ConsumptionTaxCtrlCodeText1,
                                "info": item.CountryCode
                            });
                        });
                        this.openF4Dialog("Tax Traiff Code", formattedData, oEvent.getSource().getId());
                    }).catch(err => {
                        MessageBox.error("Failed to load data for Tax Traiff Code: " + err.message);
                    });
                },
                onValueHelpRequestHierarchyServiceNumber: function (oEvent) {
                    let model = this.getOwnerComponent().getModel("masterServiceModel"),
                        entityset = "/ZI_HIERSERVNO"
                    this.getF4Data(model, entityset).then(data => {
                        let formattedData = [];
                        data?.results.forEach(item => {
                            formattedData.push({
                                "title": item.SERVNO,
                                "description": item.HIERARCHYSRVNO
                            });
                        });
                        this.openF4Dialog("Hierarchy Service Number", formattedData, oEvent.getSource().getId());
                    }).catch(err => {
                        MessageBox.error("Failed to load data for Hierarchy Service Number: " + err.message);
                    });
                },
                onValueHelpRequestEANcat: function (oEvent) {
                    let model = this.getOwnerComponent().getModel("masterServiceModel"),
                        entityset = "/ZI_EANCATEGORY",
                        filters = [new sap.ui.model.Filter("LANGUAGE", sap.ui.model.FilterOperator.EQ, "EN")];
                    this.getF4Data(model, entityset, filters).then(data => {
                        let formattedData = [];
                        data?.results.forEach(item => {
                            formattedData.push({
                                "title": item.EAN,
                                "description": item.DESCRIPTION
                            });
                        });
                        this.openF4Dialog("Ean Category", formattedData, oEvent.getSource().getId());
                    }).catch(err => {
                        MessageBox.error("Failed to load data for Ean Category: " + err.message);
                    });
                },
                onValueHelpRequestCoastingModel: function (oEvent) {
                    let model = this.getOwnerComponent().getModel("masterServiceModel"),
                        entityset = "/ZI_COSTMODEL",
                        filters = [new sap.ui.model.Filter("LANGUAGE", sap.ui.model.FilterOperator.EQ, "EN")];
                    this.getF4Data(model, entityset, filters).then(data => {
                        let formattedData = [];
                        data?.results.forEach(item => {
                            formattedData.push({
                                "title": item.COSTMODEL,
                                "description": item.DESCRIPTION,
                                "info": item.SEQNO
                            });
                        });
                        this.openF4Dialog("Costing Model", formattedData, oEvent.getSource().getId());
                    }).catch(err => {
                        MessageBox.error("Failed to load data for Costing Model: " + err.message);
                    });
                },
                onValueHelpRequestServiceCategory: function (oEvent) {
                    var model = this.getOwnerComponent().getModel("masterServiceModel");
                    var entityset = "/ZI_SERVCAT";
                    var filters = [
                        new sap.ui.model.Filter("LANGUAGE", sap.ui.model.FilterOperator.EQ, "EN")
                    ];

                    return this.getF4Data(model, entityset, filters)
                        .then(function (data) {
                            var formattedData = [];

                            (data.results || []).forEach(function (item) {
                                formattedData.push({
                                    ServiceType: item.SERVICECATEGORY,
                                    ServiceTypeName: item.DESCRIPTION,
                                    title: item.SERVICECATEGORY,
                                    description: item.DESCRIPTION
                                });
                            });
                            if (oEvent) {
                                this.openF4Dialog(
                                    "Service Category",
                                    formattedData,
                                    oEvent.getSource().getId()
                                );
                            }

                            return formattedData;
                        }.bind(this))
                        .catch(function (err) {
                            MessageBox.error(
                                "Failed to load data for Service Type"
                            );
                            return [];
                        });
                },
                onCopySrv: async function () {
                    if (!this.CopyPopup) {
                        const oDialog = await Fragment.load({
                            id: this.getView().getId(),
                            name: "com.mdg.service.servicemaster.fragments.srvRequest",
                            controller: this
                        });
                        this.getView().addDependent(oDialog);
                        this.CopyPopup = oDialog;
                    }
                    this.CopyPopup.open();
                },
                onServiceSearch: function (oEvent) {
                    var sValue = oEvent.getParameter("value");
                    var oSource = oEvent.getSource();
                    var oBinding = oSource.getBinding("items");

                    if (!oBinding) {
                        return;
                    }
                    if (!sValue) {
                        oBinding.filter([]);
                        return;
                    }

                    var aFilters = [];
                    aFilters.push(new sap.ui.model.Filter(
                        "PoServiceNumber",
                        sap.ui.model.FilterOperator.Contains,
                        sValue
                    ));
                    aFilters.push(new sap.ui.model.Filter(
                        "POServiceDesc",
                        sap.ui.model.FilterOperator.Contains,
                        sValue
                    ));
                    var oCombinedFilter = new sap.ui.model.Filter({
                        filters: aFilters,
                        and: false
                    });

                    oBinding.filter([oCombinedFilter]);
                },
                onServiceClose: function (oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");

                    if (!oSelectedItem) {
                        return; 
                    }
                    var sServiceNumber = oSelectedItem.getBindingContext("masterServiceModel").getProperty("PoServiceNumber");

                    sServiceNumber = sServiceNumber.replace(/\D/g, "").padStart(18, "0");


                    this.updateServiceRequestModel(sServiceNumber);
                },


                onServiceCancel: function () {
                    if (this.CopyPopup) {
                        this.CopyPopup.close();
                    }
                },
              updateServiceRequestModel: function (sServiceNumber) {
                    var oView = this.getView();
                    var that = this;

                    that.onOpenBusyDialog();

                    var oMasterModel = this.getOwnerComponent().getModel("masterServiceModel");

                    var aFilters = [
                        new sap.ui.model.Filter(
                            "SERVICENUMBER",
                            sap.ui.model.FilterOperator.EQ,
                            sServiceNumber
                        )
                    ];

                    oMasterModel.read("/ETY_GETDETAILSSet", {
                        filters: aFilters,
                        success: function (oData) {

                            if (!oData.results || oData.results.length === 0) {
                                that.onCloseBusyDialog();
                                return;
                            }

                            var serviceCollection =
                                that.getChangeExtendServiceRequestObject(oView, oData);

                            that.updateModel(oView, serviceCollection);

                            that.ServiceModelData = JSON.parse(
                                JSON.stringify(oView.getModel("serviceModel").getData())
                            );

                            that.onCloseBusyDialog();
                        },
                        error: function () {
                            that.onCloseBusyDialog();
                            MessageBox.error("Failed to fetch service details");
                        }
                    });
                },

                onOpenBusyDialog: function () {
                    if (!this._busyDialog) {
                        this._busyDialog = new sap.m.BusyDialog();
                        this.getView().addDependent(this._busyDialog);
                    }
                    this._busyDialog.open();
                },

                onCloseBusyDialog: function () {
                    if (this._busyDialog) {
                        this._busyDialog.close();
                    }
                },

                getChangeExtendServiceRequestObject: function (oView, oData) {
                    var productItems = oData.results || [];
                    var serviceCollection = [];

                    productItems.forEach(function (item) {
                        var objService = this.getServiceObject();

                        objService.ServiceType = item.SRVTYPE || "";
                        objService.ServiceCategory = item.SERVICECATEGORY || "";
                        objService.Division = item.DIVISION || "";
                        objService.ServiceGroup = item.MATERIALGROUP || "";
                        objService.HierarchyServiceNumber = item.HIERARCHYSRV || "";

                        objService.BaseUnitOfMeasure = item.BASEUOM || "";
                        objService.UnitOfWork = item.WORKUOM || "";

                        objService.LongText = item.SHORTTEXT || "";
                        objService.ServiceDescriptions = [{
                            ActivityNumber: (item.SERVICENUMBER || "").replace(/^0+(?!$)/, ""),
                            Description: item.SHORTTEXT || ""
                        }];

                        objService.UPC = item.EANUPC || "";
                        objService.EANCategory = item.EANCAT || "";
                        objService.ValuationClass = item.VALUATIONCLASS || "";
                        objService.TaxIndicator = item.TAXIND || "";
                        objService.TaxTraiffCode = item.TAXTARIFFCODE || "";

                        objService.Formula = item.FORMULA || "";
                        objService.Numberator = item.CONVNUM || "";
                        objService.Denominator = item.CONVDEN || "";

                        objService.Wagetype = item.WAGETYPE || "";
                        objService.PurchasingStatus = item.PURCHSTATUS || "";
                        objService.ValidityDate = item.VALIDFROM || "";
                        objService.Edition = item.EDITION || "";

                        objService.SSC = item.SSCITEM || "";
                        objService.SubContractorGroup = item.AUTHGROUP || "";

                        serviceCollection.push(objService);
                    }.bind(this));

                    return serviceCollection;
                },

                updateModel: function (oView, serviceCollection) {
                    var oServiceModel = oView.getModel("serviceModel");

                    var existingCollection =
                        oServiceModel.getProperty("/ServiceCollection") || [];

                    oServiceModel.setProperty(
                        "/ServiceCollection",
                        existingCollection.concat(serviceCollection)
                    );

                    oServiceModel.refresh(true);
                }
            }
        );
    }
);