const cds = require("@sap/cds");
const SequenceHelper = require("./lib/SequenceHelper");

class ZMDGGlMaster extends cds.ApplicationService {
  async init() {
    const db = await cds.connect.to("db");
    const { GlMasterRequests } = this.entities;

    this.before("CREATE", GlMasterRequests, async (req) => {

      let requestIdSequence = new SequenceHelper({
        db: db,
        table: "COM_SAP_GLMASTER_GLMASTERREQUESTS",
        field: "REQUESTID"
      });

      // prefix
      let prefix = "REQ";
      if (req.data.type === "Change") prefix = "CRQ";
      else if (req.data.type === "Extend") prefix = "EXQ";

      // get next number
      const nextNumber = await requestIdSequence.getNextNumber();

      // zero-padding
      const zeroPad = String(nextNumber).padStart(7, "0");

      req.data.requestIdSequence = nextNumber;
      req.data.requestId = `${prefix}${zeroPad}`;
    });

    return super.init();
  }
}

module.exports = ZMDGGlMaster;