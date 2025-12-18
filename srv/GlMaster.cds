using com.sap.glmaster as db from '../db/data';

service ZMDGGlMaster {

    entity GlMasterRequests as projection on db.GlMasterRequests;
}