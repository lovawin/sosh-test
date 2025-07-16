import styled from "styled-components";

export const StyledCustomTable = styled.div`
  .table-heading {
    margin-top:32px ;
    margin-bottom: 32px;
    span {
      font-family: Poppins;
      font-size: 24px;
      font-weight: 700;
      line-height: 36px;
      text-align: left;
    }
  }
  .transaction-table {
    --bs-table-bg-state: initial !important;
    --bs-table-color: initial !important;
    --bs-table-bg: initial !important;
    --bs-table-border-color: initial !important;
    --bs-table-accent-bg: initial !important;
    --bs-table-striped-color: initial !important;
    --bs-table-striped-bg: initial !important;

    table {
      width: 100%;
      margin-bottom: 1rem;
      vertical-align: top;
      border-color: #dee2e6;
    }

    thead {
      tr {
        border-bottom: 2px solid #dee2e6;
      }
    }

    tbody {
      tr {
        td {
          font-size: 16px;
          font-weight: 400;
          line-height: 24px;
          text-align: left;
        }
      }
    }
  }
`;
