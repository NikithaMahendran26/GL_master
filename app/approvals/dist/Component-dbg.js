sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
  "use strict";

  return UIComponent.extend("approvals.Component", {
    metadata: { manifest: "json" },

    init: function () {
      UIComponent.prototype.init.apply(this, arguments);

      this.setModel(new JSONModel([]), "initiatorModel");
      this.setModel(new JSONModel([]), "approverModel");
      this.setModel(new JSONModel([]), "commentModel");

      this.setModel(new JSONModel({
        editable: false,
        title: "",
        closeText: "Close"
      }), "ui");

      this._setupInboxActions();
      this._initFromInbox();
    },

    _setupInboxActions: function () {
    const startup = this.getComponentData()?.startupParameters;

    if (!startup?.inboxAPI) {
        console.warn("Inbox API not available");
        return;
    }

    const inboxAPI = startup.inboxAPI;

    inboxAPI.addAction({
        action: "APPROVE",
        label: "Approve",
        type: "accept"
    }, () => this._onApprove());

    inboxAPI.addAction({
        action: "REJECT",
        label: "Reject",
        type: "reject"
    }, () => this._onReject());
},


    createContent: function () {
      this._mainView = sap.ui.view({
        id: "glTaskView",
        viewName: "approvals.view.approvals",
        type: "XML"
      });

      this._mainView.setModel(this.getModel("ui"), "ui");
      this._mainView.setModel(this.getModel("commentModel"), "commentModel");
this._mainView.setModel(this.getModel("initiatorModel"), "initiatorModel");
this._mainView.setModel(this.getModel("approverModel"), "approverModel");
      return this._mainView;
    },

    /* ===============================
       INBOX INITIALIZATION (FIXED)
       =============================== */
    _initFromInbox: function () {
      const startup = this.getComponentData()?.startupParameters;

      if (!startup?.taskModel) {
        console.error("App not launched from Inbox");
        return;
      }

      // Store task model
      this.setModel(startup.taskModel, "task");

      const taskData = startup.taskModel.getData();

      console.log("Inbox Task Data", taskData);

      /**
       * 🔑 Extract Request ID
       * Example: "REQ0000042 - GL Approval Required"
       */
      const title = taskData.TaskTitle || "";
      const reqId = title.split(" ")[0];   // REQ0000042

      if (!reqId) {
        console.error("Request ID not found in task title", title);
        return;
      }

      this._loadGL(reqId);
    },

    /* ===============================
       LOAD GL REQUEST
       =============================== */
    _loadGL: function (reqId) {
    const oModel = this.getModel("mainServiceModel") || this.getModel();

    if (!oModel) {
        console.error("OData model not found");
        return;
    }

    const sPath = `/GlMasterRequests(requestId='${reqId}')`;

    oModel.read(sPath, {
        urlParameters: {
      "$expand": "glMasterItems"
        },
        success: function (oData) {
            console.log("GL OData response", oData);

            const oGlModel = new JSONModel({
                items: oData.glMasterItems?.results || []
            });

            if (this._mainView) {
                this._mainView.setModel(oGlModel, "glModel");
            } else {
                this.setModel(oGlModel, "glModel");
            }
        }.bind(this),

        error: function (oError) {
            console.error("Failed to load GL request", oError);
        }
    });
},
    addApproverComment: function (text, user) {
      const arr = this.getModel("approverModel").getData();
      arr.push({
        Text: text,
        UserName: user,
        Date: new Date().toLocaleString()
      });
      this.getModel("approverModel").setData(arr);
      this._mergeComments();
    },

    _mergeComments: function () {
      const merged = [
        ...this.getModel("initiatorModel").getData(),
        ...this.getModel("approverModel").getData()
      ];
      merged.sort((a, b) => new Date(b.Date) - new Date(a.Date));
      this.getModel("commentModel").setData(merged);
    },

    _onApprove: async function () {
    try {
        const result = await this._postGLToSAP();

        if (!result.success) {
            sap.m.MessageBox.error(
                "SAP Error:\n" + result.error
            );
            return;
        }

        sap.m.MessageToast.show("GL Account approved & created");

        const oGlModel =
    this._mainView?.getModel("glModel") ||
    this.getModel("glModel");

if (!oGlModel) {
    sap.m.MessageBox.error("GL data not loaded yet");
    return;
}

const oGL = oGlModel.getData()?.items?.[0];

if (!oGL) {
    sap.m.MessageBox.error("GL data is empty");
    return;
}


        this._openSuccessDialog(oGL);

        this._completeWorkflowTask();

    } catch (e) {
        sap.m.MessageBox.error(e.message || "Approval failed");
    }
},

_openSuccessDialog: function (oGL) {
    if (!this._successDialog) {
        this._successDialog = sap.ui.core.Fragment.load({
            name: "approvals.fragments.SuccessDialog",
            controller: this
        }).then(oDialog => {
            this._mainView.addDependent(oDialog);
            return oDialog;
        });
    }

    this._successDialog.then(oDialog => {
        const oModel = new sap.ui.model.json.JSONModel({
            GLAccount: oGL.GLAccount,
            CompanyCode: oGL.CompanyCode
        });

        oDialog.setModel(oModel, "successModel");
        oDialog.open();
    });
},

_postGLToSAP: function () {
  return new Promise((resolve) => {

    const oModel = this.getModel("CreateGLServiceModel");

    if (!oModel) {
      resolve({ success: false, error: "CreateGLServiceModel not found" });
      return;
    }

    const oGlModel =
      this._mainView?.getModel("glModel") ||
      this.getModel("glModel");

    if (!oGlModel) {
      resolve({ success: false, error: "GL data model not available" });
      return;
    }

    const oData = oGlModel.getData();
    const oGL = oData?.items?.[0];

    if (!oGL) {
      resolve({ success: false, error: "GL request data is empty" });
      return;
    }

    const payload = {
      GLACCNO: oGL.GLAccount || "",
      //CHACCTS: oGL.ChartOfAccounts || "",
      CHACCTS:"INT",
      ACCGRP: oGL.AccountGroup || "",
      GLACCTYPE: oGL.GLAccountType || "",
      LANGUAGE: "EN",
      SHTEXT: oGL.ShortText || "",
      LGTEXT: oGL.GLAccountLongText || "",
      COMPCODE: oGL.CompanyCode || "",
      CURRENCY: oGL.AccountCurrency || "",
      FELDSTGRP: oGL.FieldStatusGroup || "",
      HOUSEBK: oGL.HouseBank || "",
      BALINLCLCURR: oGL.LocalCurrencyOnly === true ? "X" : "",
      TAXCATEGORY: oGL.TaxCategory || "",
      //RECONACCT: oGL.ReconciliationAccount || "",
      RECONACCT:"K",
      //SORTKEY: oGL.SortKey || "",
      SORTKEY: "012",
      CONTROLLINGAREA: "NESC",
      PLACCT: oGL.PlanningAccount || "",
      BALSHEETINDI: oGL.BalanceSheetIndicator || "",
      TRADEPARTNO: oGL.TradingPartner || "",
      EXRTDIFFKEY: oGL.ExchangeRateDiffKey || "",
      ALTACCTNO: oGL.AlternateAccount || "",
      INFKEY: oGL.InflationKey || "",
      PSTWOTAX: oGL.PostWithoutTax || "",
      ACTMNGEXT: oGL.OpenItemManagement === true ? "X" : "",
      TOLGRP: oGL.ToleranceGroup || "",
      XLGCLR: oGL.LineItemDisplay || "",
      XOPVW: oGL.OpenItemView || "",
      AUTHGRP: oGL.AuthorizationGroup || "",
      CLERKABBV: oGL.ClerkAbbreviation || "",
      RECID: oGL.RecId || "",
      SUPAUTOPOST: oGL.SupplementAutoPost || "",
      RECONACTINPUT: oGL.ReconAccountInput || "",
      PLANLEVEL: oGL.PlanningLevel || "",
      CASHFLOWREL: oGL.CashFlowRelevant || "",
      COMMITITEM: oGL.CommitmentItem || "",
      ACCTID: oGL.AccountId || "",
      INTINDICATOR: oGL.InterestIndicator || "",
      INTCALCFREQ: oGL.InterestCalcFrequency || "",
      ZINDT: oGL.InterestKeyDate || "",
      DATLZ: oGL.LastInterestCalcDate || "",
      POSTAUTO: oGL.AutoPost || ""
    };

    oModel.create("/ETY_CREATEGLSet", payload, {
      success: function () {
        resolve({ success: true });
      },
      error: function (oError) {
        let message = "Unknown SAP error";
        try {
          const resp = JSON.parse(oError.responseText);
          message =
            resp?.error?.message?.value ||
            resp?.error?.innererror?.errordetails?.[0]?.message ||
            message;
        } catch (e) {}

        resolve({ success: false, error: message });
      }
    });
  });
},



onSuccessDialogClose: function (oEvent) {
    oEvent.getSource().getParent().close();
},

    _fetchWorkflowToken: async function () {
  const res = await fetch(
    "/bpmworkflowruntime/v1/xsrf-token",
    {
      method: "GET",
      headers: {
        "X-CSRF-Token": "Fetch"
      },
      credentials: "include"
    }
  );

  return res.headers.get("X-CSRF-Token");
},

_completeWorkflowTask: async function () {
  const base = this._getWorkflowBaseURL();
  const taskId = this.getModel("task").getData().InstanceID;

  const token = await this._fetchWorkflowToken();

  const res = await fetch(
    `${base}/task-instances/${taskId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": token
      },
      credentials: "include",
      body: JSON.stringify({
        status: "COMPLETED"
      })
    }
  );

  if (!res.ok) {
    throw new Error("Workflow task completion failed");
  }
},


    _getWorkflowBaseURL: function () {
  return "/bpmworkflowruntime/v1";
}


  });
});
