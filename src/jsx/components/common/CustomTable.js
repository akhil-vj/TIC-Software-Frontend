import React,{useState} from "react";
import NoData from "./NoData";
import { Dropdown } from "react-bootstrap";
import DeleteModal from "./DeleteModal";
import { axiosDelete } from "../../../services/AxiosInstance";
import { notifyDelete, notifyError } from "../../utilis/notifyMessage";

const initialType = {write:true,update:true,delete:true}
export const CustomTable = ({
  children,
  length,
  itemsPerPage = 8,
  tableArray = [],
  data = [],
  loading,
  url,
  url2,
  permissionType = initialType,
  selectedRows = [],
  setSelectedRows = () => {},
  isSelectionMode = false,
  setIsSelectionMode = () => {}
}) => {
  // const tableData = data;
  // Initialize variables for body1 and body2 children
  let tHead = [];
  let tBody = [];

  // Loop through the children and separate them into body1 and body2
  React.Children.forEach(children, (child) => {
    if (child.type === "THead") {
      tHead.push(child);
    } else if (child.type === "TBody") {
      tBody.push(child);
    }
  });

  const [currentPage, setCurrentPage] = React.useState(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationUrl, setConfirmationUrl] = useState("");
  const [confirmationName, setConfirmationName] = useState("");
  const [confirmationType, setConfirmationType] = useState("");

  const totalPages = Math.ceil(length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const tableData = data.slice(startIndex, endIndex);

  const sort = 8;
  const activePag = React.useRef(0);
  const chageData = (frist, sec) => {
    // for (var i = 0; i < data.length; ++i) {
    //   if (i >= frist && i < sec) {
    //     data[i].classList.remove("d-none");
    //   } else {
    //     data[i].classList.add("d-none");
    //   }
    // }
  };

  // Active pagginarion
  activePag.current === 0 && chageData(0, sort);
  // paggination
  let paggination = Array(Math.ceil(data.length / sort))
    .fill()
    .map((_, i) => i + 1);

  const changePage = (newPage) => {
    // console.log(newPage)
    // newPage+=1 //rm if any issue
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const showValue = (value) => {
    const isArray = Array.isArray(value)
    let listValue
    if(isArray){
      listValue = value?.map(item => item.name).join(', ')
    }else{
      listValue = value
    }
    return listValue
  }

  const getValue = (data, val, condition) => {
    const keys = val;
    if (Array.isArray(keys)) {
      let value = data;
      keys.forEach((key) => {
        value = value?.[key];
      });
      if(!value && !!condition){
        let value2 = data;
        let keys2 = condition
      keys2.forEach((key) => {
        value2 = value2?.[key];
      });
      return showValue(value2);
      }
      return showValue(value);
    } else {
      return showValue(data[keys]);
    }
  };

  const onConfirmation = (id,name,type='delete',updateValue) => {
    let confirmUrl = `${url}/${id}`
    let statusUrl = `${url2}/${id}`
    let confirmName = name
    if(type === 'status'){
      const isActive = updateValue === 1
      const value = isActive ?"Active":'Inactive'
      confirmUrl = `${statusUrl}?is_active=${updateValue}`
      confirmName = `${value} ${confirmName}`
    }
    setConfirmationUrl(confirmUrl)
    setConfirmationName(confirmName)
    setConfirmationType(type)
    setShowConfirmationModal(true)
  }

  const handleSelectRow = (id) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  }

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map(item => item.id));
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      notifyError("Please select at least one enquiry to delete");
      return;
    }

    try {
      // Delete each selected row
      await Promise.all(
        selectedRows.map(id => axiosDelete(`${url}/${id}`))
      );
      notifyDelete("Selected Enquiries");
      setSelectedRows([]);
      setIsSelectionMode(false);
      // Refresh the data
      window.location.reload();
    } catch (error) {
      console.log("Error deleting enquiries:", error);
      notifyError(error);
    }
  }

  return (
    <>
    <div className="row">
      <div className="col-xl-12">
        {isSelectionMode && selectedRows.length > 0 && (
          <div className="alert alert-info mb-3 d-flex justify-content-between align-items-center">
            <span>{selectedRows.length} enquiries selected</span>
            <button 
              className="btn btn-danger btn-sm"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
          </div>
        )}
        <div
          className="table-responsive  full-data dataTables_wrapper"
          id="example2_wrapper"
        >
          <table
            className="table-responsive-lg table display mb-4 dataTablesCard  text-black dataTable no-footer custom-table"
            id="example2"
          >
            <thead>
              <tr>
                {isSelectionMode && (
                  <th className="text-center" style={{width: '40px'}}>
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedRows.length === data.length && data.length > 0}
                      className="form-check-input"
                    />
                  </th>
                )}
                {/* {tHead} */}
                {tableArray?.map((item, key) => (
                  <th
                    key={key}
                    className={item?.className ? item.className : ""}
                  >
                    {item?.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.length === 0 ? (
                <NoData isLoading={loading} />
              ) : (
                tableData.map((item, index) => (
                  <tr key={index} className={selectedRows.includes(item.id) ? 'table-active' : ''}>
                    {isSelectionMode && (
                      <td className="text-center">
                        <input
                          type="checkbox"
                          onChange={() => handleSelectRow(item.id)}
                          checked={selectedRows.includes(item.id)}
                          className="form-check-input"
                        />
                      </td>
                    )}
                    {/* {tBody} */}
                    {tableArray?.map((arrValue, key) => {
                      // console.log('arrvalue',item?.[arrValue?.value])
                      return (
                        <React.Fragment key={key}>
                       { arrValue?.label === 'Status' ? 
                        <td className="">
                        <span
                          className={`btn light fs-14  btn-sm ${item[arrValue?.value] === 1 ?'btn-success':'btn-pink'}`}
                        >
                          {/* {item.icon2} */}
                                                      {" "} 
                          {item[arrValue?.value] === 1 ?'Active':'Inactive'}

                        </span>
                      </td>
                      :
                      arrValue?.label === 'Actions' ? 
                      <td>
                          <Dropdown>
                            <Dropdown.Toggle
                              as="div"
                              className="i-false btn-link btn sharp tp-btn btn-primary pill"
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8.33319 9.99985C8.33319 10.9203 9.07938 11.6665 9.99986 11.6665C10.9203 11.6665 11.6665 10.9203 11.6665 9.99986C11.6665 9.07938 10.9203 8.33319 9.99986 8.33319C9.07938 8.33319 8.33319 9.07938 8.33319 9.99985Z"
                                  fill="#ffffff"
                                />
                                <path
                                  d="M8.33319 3.33329C8.33319 4.25376 9.07938 4.99995 9.99986 4.99995C10.9203 4.99995 11.6665 4.25376 11.6665 3.33329C11.6665 2.41282 10.9203 1.66663 9.99986 1.66663C9.07938 1.66663 8.33319 2.41282 8.33319 3.33329Z"
                                  fill="#ffffff"
                                />
                                <path
                                  d="M8.33319 16.6667C8.33319 17.5871 9.07938 18.3333 9.99986 18.3333C10.9203 18.3333 11.6665 17.5871 11.6665 16.6667C11.6665 15.7462 10.9203 15 9.99986 15C9.07938 15 8.33319 15.7462 8.33319 16.6667Z"
                                  fill="#ffffff"
                                />
                              </svg>
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="dropdown-menu-end">
                              {arrValue?.value.map((dropItem,key)=>(
                                <React.Fragment key={key}>
                                  {dropItem.menu === 'Select' && permissionType.delete?
                                  <Dropdown.Item
                                    onClick={() => setIsSelectionMode(!isSelectionMode)}
                                  >
                                    {isSelectionMode ? 'Cancel Selection' : 'Select'}
                                  </Dropdown.Item>
                                  :
                                  dropItem.menu === 'Status'?
                                  
                              <Dropdown.Item
                                onClick={() => onConfirmation(item?.id,item[dropItem.showLabel],'status',item[dropItem.showValue] === 1 ? 0:1)}
                              >
                                {item[dropItem.showValue] === 1 ? 'Inactive':'Active'}
                              </Dropdown.Item>
                                  :
                                  <>
                                  {dropItem.menu === 'Delete'?
                                  <>
                             {permissionType.delete && <Dropdown.Item
                                onClick={() => onConfirmation(item?.id,item[dropItem.showLabel])}
                              >
                                {dropItem.menu}
                              </Dropdown.Item>
                              }</>
                              :
                              <>
                              {/* use non-edit btn logic also */}
                             {permissionType.update &&
                              <Dropdown.Item
                              onClick={() => dropItem.onPress(item?.id,item[dropItem.showLabel])}
                            >
                              {dropItem.menu}
                            </Dropdown.Item>
                            }</>
                              }
                              </>
                                  }
                                </React.Fragment>


                              ))}
                              
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      :

                        <td
                          className={`${arrValue?.className ? arrValue.className : ""} custom-cell`}
                        >
                          {arrValue?.value === 'index'? index+1 :getValue(item, arrValue?.value,arrValue?.condition)}
                        </td>
                    }
                    </React.Fragment>
                    )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="d-sm-flex text-center justify-content-between align-items-center mt-3 mb-3">
            <div className="dataTables_info">
              Showing {activePag.current * sort + 1} to{" "}
              {data.length > (activePag.current + 1) * sort
                ? (activePag.current + 1) * sort
                : data.length}{" "}
              of {data.length} entries
            </div>
            <div
              className="dataTables_paginate paging_simple_numbers mb-0"
              id="example2_paginate"
            >
              <button
                className="paginate_button previous disabled"
                // to="/invoice"
                onClick={() =>
                  // activePag.current > 0 && 
                  changePage(currentPage - 1)
                }
              >
                <i className="fa-solid fa-angle-left"></i>
              </button>
              <span>
                {paggination.map((number, i) => (
                  <button
                    key={i}
                    // to=""
                    className={`paginate_button  ${
                      currentPage === number ? "current" : ""
                    } `}
                    onClick={() => changePage(number)}
                  >
                    {number}
                  </button>
                ))}
              </span>

              <button
                className="paginate_button next"
                // to=""
                onClick={() =>
                  // activePag.current + 1 < paggination.length &&
                  changePage(currentPage + 1)
                }
              >
                <i className="fa-solid fa-angle-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <DeleteModal
        showModal={showConfirmationModal}
        setShowModal={setShowConfirmationModal}
        name={confirmationName}
        url={confirmationUrl}
        type={confirmationType}
      />
    </>
  );
};
