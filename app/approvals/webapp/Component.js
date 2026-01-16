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

      this._initFromInbox();
    },

    createContent: function () {
      this._mainView = sap.ui.view({
        id: "glTaskView",
        viewName: "approvals.view.approvals",
        type: "XML"
      });

      this._mainView.setModel(this.getModel("ui"), "ui");
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
    }
  });
});
