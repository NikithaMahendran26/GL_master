namespace com.sap.glmaster;

using {
    cuid,
    managed
} from '@sap/cds/common';

@assert.range
type RequestStatus  : String enum {
    Draft;
    Submitted;
    ![service Master Created];
    Cancelled;
    Error;
    Rejected;
    Rework;
}

@assert.range
type WorkflowStatus : String enum {
    Draft;
    Rejected;
    Rework;
    Completed;
    Initiator;
    ![In Approval];
}

type Type           : String enum {
    Create;
    Change;
    Extend;
    Draft;
}

entity GlMasterRequests : managed {
    key requestId          : String(11);
        workflowStatus     : WorkflowStatus;
        requestIdSequence  : Integer;
        type               : Type;
        workflowInstanceId : String(50) null;
        CreatedOn          : Date;
        ApprovedOn         : Date;
        ApprovedBy         : String;
        glMasterItems : Composition of many GlMasterItems
                                 on glMasterItems.glMasterRequests = $self;
}

entity GlMasterItems : cuid {
    key glMasterRequests   : Association to GlMasterRequests;
        GlCategory        : String;
        ServiceType            : String;
        BaseUnitOfMeasure      : String;
        ServiceGroup           : String;
        Division               : String;
        TaxIndicator           : String;
        ShortTextAllowed       : Boolean;
        LongText               : String;
        ValuationClass         : String;
        Formula                : String;
        Graphic                : String;
        SSC                    : String;
        HierarchyServiceNumber : String;
        Wagetype               : String;
        UPC                    : String;
        EANCategory            : String;
        PurchasingStatus       : String;
        ValidityDate           : Date;
        Numberator             : String;
        Denominator            : String;
        SubContractorGroup     : String;
        CoastingModel          : String;
        UnitOfWork             : String;
        TaxTraiffCode          : String;
        Edition                : String;
}