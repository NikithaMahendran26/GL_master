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
    key glMasterRequests      : Association to GlMasterRequests;
        GLAccount             : String;
        CompanyCode           : String;
        GLAccountType         : String;
        AccountGroup          : String;
        ShortText             : String;
        GLAccountLongText     : String;
        AccountCurrency       : String;
        LocalCurrencyOnly     : Boolean;
        PostingWithoutTax     : Boolean;
        ReconciliationAccount : Boolean;
        OpenItemManagement    : Boolean;
        PostAutomatically     : Boolean;
        CashFlowRelevant      : Boolean;
        TaxCategory           : String;
        SortKey               : String;
        FieldStatusGroup      : String;
        HouseBank             : String;
        AccountID             : String;
}