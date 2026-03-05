import React, { useState } from "react";

const CompanySettings = () => {
  const [logo, setLogo] = useState(null);
  const [headerImage, setHeaderImage] = useState(null);
  const [footerImage, setFooterImage] = useState(null);
  const [contactAddresses, setContactAddresses] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({
    label: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    streetAddress1: '',
    streetAddress2: '',
    landmark: '',
    countryCode: '+66',
    phone: '',
    email: '',
    destinations: '',
    isPrimary: false
  });
  const [billingAddresses, setBillingAddresses] = useState([]);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [editingBilling, setEditingBilling] = useState(null);
  const [billingForm, setBillingForm] = useState({
    label: '',
    address: '',
    phone: '',
    email: '',
    billingId: '',
    destinations: '',
    isPrimary: false
  });
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [bankForm, setBankForm] = useState({
    accountName: '',
    bankName: '',
    branchName: '',
    swiftCode: '',
    accountNumber: '',
    linkedAccount: '',
    currency: 'THB'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  const addContactAddress = () => {
    setContactForm({
      label: '',
      city: '',
      state: '',
      country: '',
      pinCode: '',
      streetAddress1: '',
      streetAddress2: '',
      landmark: '',
      countryCode: '+66',
      phone: '',
      email: '',
      destinations: '',
      isPrimary: false
    });
    setEditingContact(null);
    setShowContactModal(true);
  };

  const editContactAddress = (contact) => {
    setContactForm(contact);
    setEditingContact(contact.id);
    setShowContactModal(true);
  };

  const removeContactAddress = (id) => {
    setContactAddresses(contactAddresses.filter(addr => addr.id !== id));
  };

  const handleContactFormChange = (field, value) => {
    setContactForm({ ...contactForm, [field]: value });
  };

  const saveContactAddress = () => {
    if (editingContact) {
      setContactAddresses(contactAddresses.map(addr => 
        addr.id === editingContact ? { ...contactForm, id: editingContact } : addr
      ));
    } else {
      setContactAddresses([...contactAddresses, { ...contactForm, id: Date.now() }]);
    }
    setShowContactModal(false);
  };

  const addBillingAddress = () => {
    setBillingForm({
      label: '',
      address: '',
      phone: '',
      email: '',
      billingId: '',
      destinations: '',
      isPrimary: false
    });
    setEditingBilling(null);
    setShowBillingModal(true);
  };

  const editBillingAddress = (billing) => {
    setBillingForm(billing);
    setEditingBilling(billing.id);
    setShowBillingModal(true);
  };

  const handleBillingFormChange = (field, value) => {
    setBillingForm({ ...billingForm, [field]: value });
  };

  const saveBillingAddress = () => {
    if (editingBilling) {
      setBillingAddresses(billingAddresses.map(addr => 
        addr.id === editingBilling ? { ...billingForm, id: editingBilling } : addr
      ));
    } else {
      setBillingAddresses([...billingAddresses, { ...billingForm, id: Date.now() }]);
    }
    setShowBillingModal(false);
  };

  const removeBillingAddress = (id) => {
    setBillingAddresses(billingAddresses.filter(addr => addr.id !== id));
  };

  const addBankAccount = () => {
    setBankForm({
      accountName: '',
      bankName: '',
      branchName: '',
      swiftCode: '',
      accountNumber: '',
      linkedAccount: '',
      currency: 'THB'
    });
    setEditingBank(null);
    setShowBankModal(true);
  };

  const editBankAccount = (bank) => {
    setBankForm(bank);
    setEditingBank(bank.id);
    setShowBankModal(true);
  };

  const handleBankFormChange = (field, value) => {
    setBankForm({ ...bankForm, [field]: value });
  };

  const saveBankAccount = () => {
    if (editingBank) {
      setBankAccounts(bankAccounts.map(acc => 
        acc.id === editingBank ? { ...bankForm, id: editingBank } : acc
      ));
    } else {
      setBankAccounts([...bankAccounts, { ...bankForm, id: Date.now() }]);
    }
    setShowBankModal(false);
  };

  const removeBankAccount = (id) => {
    setBankAccounts(bankAccounts.filter(acc => acc.id !== id));
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h4 className="mb-1" style={{ fontWeight: 600 }}>Organization Profile</h4>
              <p className="text-muted mb-0" style={{ fontSize: '14px' }}>Manage your company information and settings</p>
            </div>
          </div>

          {/* Main Card */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              
              {/* Basic Information Section */}
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3 pb-3" style={{ borderBottom: '2px solid #e9ecef' }}>
                  <div style={{ width: '4px', height: '24px', backgroundColor: '#4361ee', marginRight: '12px' }}></div>
                  <h5 className="mb-0" style={{ fontWeight: 600, fontSize: '16px' }}>Basic Information</h5>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#495057' }}>
                      Official/Registered Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '14px', padding: '10px 14px' }}
                      placeholder=""
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#495057' }}>
                      Display/Brand/Short Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '14px', padding: '10px 14px' }}
                      placeholder=""
                      required
                    />
                  </div>
                  
                  <div className="col-md-4">
                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#495057' }}>
                      Support Phone Numbers
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '14px', padding: '10px 14px' }}
                      placeholder=""
                    />
                    <small className="text-muted" style={{ fontSize: '12px' }}>24x7 Operational</small>
                  </div>
                </div>
              </div>

              {/* Branding Section */}
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3 pb-3" style={{ borderBottom: '2px solid #e9ecef' }}>
                  <div style={{ width: '4px', height: '24px', backgroundColor: '#4361ee', marginRight: '12px' }}></div>
                  <h5 className="mb-0" style={{ fontWeight: 600, fontSize: '16px' }}>Branding</h5>
                </div>
                
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                      <label className="form-label fw-medium mb-2" style={{ fontSize: '13px', color: '#495057' }}>
                        Brand Logo <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        className="form-control mb-2"
                        accept="image/*"
                        onChange={(e) => setLogo(e.target.files[0])}
                        required
                      />
                      <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                        Image to be used as header banner in generated PDFs
                      </small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                      <label className="form-label fw-medium mb-2" style={{ fontSize: '13px', color: '#495057' }}>
                        Header Banner/Letterhead Image
                      </label>
                      <input
                        type="file"
                        className="form-control mb-2"
                        accept="image/*"
                        onChange={(e) => setHeaderImage(e.target.files[0])}
                      />
                      <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                        Image for header in generated PDFs e.g., Quote, Vouchers etc.
                      </small>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                      <label className="form-label fw-medium mb-2" style={{ fontSize: '13px', color: '#495057' }}>
                        Footer Banner Image
                      </label>
                      <input
                        type="file"
                        className="form-control mb-2"
                        accept="image/*"
                        onChange={(e) => setFooterImage(e.target.files[0])}
                      />
                      <small className="text-muted d-block" style={{ fontSize: '11px' }}>
                        Image to be used for footer in generated PDFs e.g., Quote, Vouchers etc.
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Addresses Section */}
              <div className="mb-5">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{ borderBottom: '2px solid #e9ecef' }}>
                  <div className="d-flex align-items-center">
                    <div style={{ width: '4px', height: '24px', backgroundColor: '#4361ee', marginRight: '12px' }}></div>
                    <div>
                      <h5 className="mb-0" style={{ fontWeight: 600, fontSize: '16px' }}>Contact Addresses</h5>
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Here you can manage different addresses used for contact and support purposes.
                      </small>
                    </div>
                  </div>
                  <button type="button" className="btn btn-sm btn-primary" onClick={addContactAddress}>
                    + Add New
                  </button>
                </div>
                
                {contactAddresses.length === 0 ? (
                  <div className="text-center py-5" style={{ backgroundColor: '#fafbfc', borderRadius: '8px' }}>
                    <p className="text-muted mb-0">No contact addresses added yet. Click "Add New" to create one.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th style={{ fontSize: '13px', fontWeight: 600 }}>Label</th>
                          <th style={{ fontSize: '13px', fontWeight: 600 }}>Address</th>
                          <th style={{ fontSize: '13px', fontWeight: 600 }}>Contact</th>
                          <th style={{ fontSize: '13px', fontWeight: 600 }}>Trip Destinations</th>
                          <th style={{ fontSize: '13px', fontWeight: 600, width: '100px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactAddresses.map((addr) => (
                          <tr key={addr.id}>
                            <td style={{ fontSize: '13px' }}>
                              {addr.label}
                              {addr.isPrimary && <span className="badge bg-primary ms-2" style={{ fontSize: '10px' }}>Primary</span>}
                            </td>
                            <td style={{ fontSize: '13px' }}>
                              {addr.streetAddress1}{addr.streetAddress2 && `, ${addr.streetAddress2}`}
                              {addr.landmark && `, ${addr.landmark}`}<br />
                              {addr.city}, {addr.state}, {addr.country} - {addr.pinCode}
                            </td>
                            <td style={{ fontSize: '13px' }}>
                              {addr.countryCode}-{addr.phone}<br />
                              {addr.email}
                            </td>
                            <td style={{ fontSize: '13px' }}>{addr.destinations}</td>
                            <td>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => editContactAddress(addr)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeContactAddress(addr.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Billing Addresses Section */}
              <div className="mb-5">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{ borderBottom: '2px solid #e9ecef' }}>
                  <div className="d-flex align-items-center">
                    <div style={{ width: '4px', height: '24px', backgroundColor: '#4361ee', marginRight: '12px' }}></div>
                    <div>
                      <h5 className="mb-0" style={{ fontWeight: 600, fontSize: '16px' }}>Billing Addresses</h5>
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Here you can manage different addresses used for billing purposes.
                      </small>
                    </div>
                  </div>
                  <button type="button" className="btn btn-sm btn-primary" onClick={addBillingAddress}>
                    + Add New
                  </button>
                </div>
                
                {billingAddresses.length === 0 ? (
                  <div className="text-center py-5" style={{ backgroundColor: '#fafbfc', borderRadius: '8px' }}>
                    <p className="text-muted mb-0">No billing addresses added yet. Click "Add New" to create one.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th style={{ fontSize: '13px', fontWeight: 600 }}>Label</th>
                          <th style={{ fontSize: '13px', fontWeight: 600 }}>Address</th>
                          <th style={{ fontSize: '13px', fontWeight: 600 }}>Contact</th>
                          <th style={{ fontSize: '13px', fontWeight: 600 }}>Billing Details</th>
                          <th style={{ fontSize: '13px', fontWeight: 600 }}>Trip Destinations</th>
                          <th style={{ fontSize: '13px', fontWeight: 600, width: '100px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billingAddresses.map((addr) => (
                          <tr key={addr.id}>
                            <td style={{ fontSize: '13px' }}>
                              {addr.label}
                              {addr.isPrimary && <span className="badge bg-primary ms-2" style={{ fontSize: '10px' }}>Primary</span>}
                            </td>
                            <td style={{ fontSize: '13px' }}>{addr.address}</td>
                            <td style={{ fontSize: '13px' }}>
                              {addr.phone}<br />
                              {addr.email}
                            </td>
                            <td style={{ fontSize: '13px' }}>{addr.billingId}</td>
                            <td style={{ fontSize: '13px' }}>{addr.destinations}</td>
                            <td>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => editBillingAddress(addr)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeBillingAddress(addr.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bank Account Details Section */}
              <div className="mb-5">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-3" style={{ borderBottom: '2px solid #e9ecef' }}>
                  <div className="d-flex align-items-center">
                    <div style={{ width: '4px', height: '24px', backgroundColor: '#4361ee', marginRight: '12px' }}></div>
                    <div>
                      <h5 className="mb-0" style={{ fontWeight: 600, fontSize: '16px' }}>Bank Account Details</h5>
                      <small className="text-muted" style={{ fontSize: '12px' }}>
                        Bank account details to be shared with your client in payments related communications
                      </small>
                    </div>
                  </div>
                    <button type="button" className="btn btn-sm btn-primary" onClick={addBankAccount}>
                      + Add More
                    </button>
                  </div>
                  
                  {bankAccounts.length === 0 ? (
                    <div className="text-center py-5" style={{ backgroundColor: '#fafbfc', borderRadius: '8px' }}>
                      <p className="text-muted mb-0">No bank accounts added yet. Click "Add More" to create one.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                          <tr>
                            <th style={{ fontSize: '13px', fontWeight: 600 }}>Name</th>
                            <th style={{ fontSize: '13px', fontWeight: 600 }}>Bank</th>
                            <th style={{ fontSize: '13px', fontWeight: 600 }}>Branch</th>
                            <th style={{ fontSize: '13px', fontWeight: 600 }}>Account</th>
                            <th style={{ fontSize: '13px', fontWeight: 600 }}>Currency</th>
                            <th style={{ fontSize: '13px', fontWeight: 600, width: '100px' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bankAccounts.map((acc) => (
                            <tr key={acc.id}>
                              <td style={{ fontSize: '13px' }}>{acc.accountName}</td>
                              <td style={{ fontSize: '13px' }}>{acc.bankName}</td>
                              <td style={{ fontSize: '13px' }}>{acc.branchName}</td>
                              <td style={{ fontSize: '13px' }}>
                                {acc.accountNumber}
                                {acc.swiftCode && <div className="text-muted" style={{ fontSize: '12px' }}>SWIFT/IFSC: {acc.swiftCode}</div>}
                                {acc.linkedAccount && <div className="text-muted" style={{ fontSize: '12px' }}>Linked: {acc.linkedAccount}</div>}
                              </td>
                              <td style={{ fontSize: '13px' }}>{acc.currency}</td>
                              <td>
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-primary me-1"
                                  onClick={() => editBankAccount(acc)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  type="button" 
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => removeBankAccount(acc.id)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              {/* Legal & Tax Section */}
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3 pb-3" style={{ borderBottom: '2px solid #e9ecef' }}>
                  <div style={{ width: '4px', height: '24px', backgroundColor: '#4361ee', marginRight: '12px' }}></div>
                  <h5 className="mb-0" style={{ fontWeight: 600, fontSize: '16px' }}>Legal & Tax Information</h5>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#495057' }}>
                      GST Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '14px', padding: '10px 14px' }}
                      placeholder=""
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#495057' }}>
                      PAN Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '14px', padding: '10px 14px' }}
                      placeholder=""
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#495057' }}>
                      CIN Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '14px', padding: '10px 14px' }}
                      placeholder=""
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#495057' }}>
                      VAT / Tax Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '14px', padding: '10px 14px' }}
                      placeholder=""
                    />
                  </div>
                </div>
              </div>

              {/* Currencies Section */}
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3 pb-3" style={{ borderBottom: '2px solid #e9ecef' }}>
                  <div style={{ width: '4px', height: '24px', backgroundColor: '#4361ee', marginRight: '12px' }}></div>
                  <h5 className="mb-0" style={{ fontWeight: 600, fontSize: '16px' }}>Currencies</h5>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#495057' }}>
                      Base Currency <span className="text-danger">*</span>
                    </label>
                    <select className="form-control" style={{ fontSize: '14px', padding: '10px 14px' }} required>
                      <option value="">Select Currency</option>
                      <option value="THB">THB - Thai Baht</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="SGD">SGD - Singapore Dollar</option>
                      <option value="MYR">MYR - Malaysian Ringgit</option>
                    </select>
                  </div>
                  <div className="col-md-8">
                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#495057' }}>
                      Additional Currencies
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '14px', padding: '10px 14px' }}
                      placeholder=""
                    />
                    <small className="text-muted" style={{ fontSize: '12px' }}>
                      You can add multiple currencies for multi-currency operations
                    </small>
                  </div>
                </div>
              </div>

              {/* Tax Types Section */}
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3 pb-3" style={{ borderBottom: '2px solid #e9ecef' }}>
                  <div style={{ width: '4px', height: '24px', backgroundColor: '#4361ee', marginRight: '12px' }}></div>
                  <h5 className="mb-0" style={{ fontWeight: 600, fontSize: '16px' }}>Tax Types</h5>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#495057' }}>
                      Default Tax Type
                    </label>
                    <select className="form-control" style={{ fontSize: '14px', padding: '10px 14px' }}>
                      <option value="">Select Tax Type</option>
                      <option value="vat">VAT</option>
                      <option value="gst">GST</option>
                      <option value="sales_tax">Sales Tax</option>
                      <option value="service_tax">Service Tax</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-medium" style={{ fontSize: '13px', color: '#495057' }}>
                      Default Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ fontSize: '14px', padding: '10px 14px' }}
                      placeholder=""
                      step="0.01"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="card-footer bg-white border-top" style={{ padding: '20px 30px' }}>
              <div className="d-flex justify-content-end gap-3">
                <button type="button" className="btn btn-light px-4" style={{ fontSize: '14px' }}>
                  Cancel
                </button>
                <button onClick={handleSubmit} className="btn btn-primary px-5" style={{ fontSize: '14px' }}>
                  Save Settings
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>

      {/* Bank Account Modal */}
      {showBankModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-semibold">
                  {editingBank ? 'Update Bank Account' : 'Add New Bank Account'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowBankModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                      Account Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={bankForm.accountName}
                      onChange={(e) => handleBankFormChange('accountName', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                      Account Number <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={bankForm.accountNumber}
                      onChange={(e) => handleBankFormChange('accountNumber', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                      Bank Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={bankForm.bankName}
                      onChange={(e) => handleBankFormChange('bankName', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                      Branch Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={bankForm.branchName}
                      onChange={(e) => handleBankFormChange('branchName', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                      SWIFT / IFSC
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={bankForm.swiftCode}
                      onChange={(e) => handleBankFormChange('swiftCode', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                      Linked Account
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={bankForm.linkedAccount}
                      onChange={(e) => handleBankFormChange('linkedAccount', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                      Currency
                    </label>
                    <select
                      className="form-control"
                      value={bankForm.currency}
                      onChange={(e) => handleBankFormChange('currency', e.target.value)}
                    >
                      <option value="THB">THB - Thai Baht</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="SGD">SGD - Singapore Dollar</option>
                      <option value="MYR">MYR - Malaysian Ringgit</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-light" onClick={() => setShowBankModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={saveBankAccount}>
                  Save Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Address Modal */}
      {showBillingModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-semibold">
                  {editingBilling ? 'Update Billing Address' : 'Add New Billing Address'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowBillingModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-tag me-2" style={{ fontSize: '20px' }}></i>
                    <h6 className="mb-0 fw-semibold">Label</h6>
                  </div>
                  <p className="text-muted" style={{ fontSize: '13px' }}>
                    Please provide label/short name for billing address for your internal references.
                  </p>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Billing address label"
                    value={billingForm.label}
                    onChange={(e) => handleBillingFormChange('label', e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-geo-alt me-2" style={{ fontSize: '20px' }}></i>
                    <h6 className="mb-0 fw-semibold">Billing Address</h6>
                  </div>
                  <p className="text-muted" style={{ fontSize: '13px' }}>
                    Provide the full billing address as it should appear on invoices.
                  </p>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={billingForm.address}
                    onChange={(e) => handleBillingFormChange('address', e.target.value)}
                    placeholder="Street, City, Country, Postal Code"
                  ></textarea>
                </div>

                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-telephone me-2" style={{ fontSize: '20px' }}></i>
                    <h6 className="mb-0 fw-semibold">Contact Details</h6>
                  </div>
                  <p className="text-muted" style={{ fontSize: '13px' }}>
                    Add phone and email to reach for billing communications.
                  </p>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Phone Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={billingForm.phone}
                        onChange={(e) => handleBillingFormChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Billing Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={billingForm.email}
                        onChange={(e) => handleBillingFormChange('email', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-receipt me-2" style={{ fontSize: '20px' }}></i>
                    <h6 className="mb-0 fw-semibold">Billing Details</h6>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Billing ID / Tax Number
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={billingForm.billingId}
                        onChange={(e) => handleBillingFormChange('billingId', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Trip Destinations
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Thailand, Malaysia"
                        value={billingForm.destinations}
                        onChange={(e) => handleBillingFormChange('destinations', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-check mt-3">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="billingPrimary"
                      checked={billingForm.isPrimary}
                      onChange={(e) => handleBillingFormChange('isPrimary', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="billingPrimary">
                      Set as Primary Billing Address
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-light" onClick={() => setShowBillingModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={saveBillingAddress}>
                  Save Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Address Modal */}
      {showContactModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-semibold">
                  {editingContact ? 'Update Address' : 'Add New Contact Address'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowContactModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                {/* Label Section */}
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-tag me-2" style={{ fontSize: '20px' }}></i>
                    <h6 className="mb-0 fw-semibold">Label</h6>
                  </div>
                  <p className="text-muted" style={{ fontSize: '13px' }}>
                    Please provide label/short name for address for your internal references.
                  </p>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Label/Short Name for Address (used for internal references)"
                    value={contactForm.label}
                    onChange={(e) => handleContactFormChange('label', e.target.value)}
                  />
                </div>

                {/* Address Details Section */}
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-geo-alt me-2" style={{ fontSize: '20px' }}></i>
                    <h6 className="mb-0 fw-semibold">Address Details</h6>
                  </div>
                  <p className="text-muted" style={{ fontSize: '13px' }}>
                    Please provide city, state and country along with street details for the address.
                  </p>
                  
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                        City / Town / District
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={contactForm.city}
                        onChange={(e) => handleContactFormChange('city', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                        State / Province / Region
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={contactForm.state}
                        onChange={(e) => handleContactFormChange('state', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Country
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={contactForm.country}
                        onChange={(e) => handleContactFormChange('country', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Pin Code
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={contactForm.pinCode}
                        onChange={(e) => handleContactFormChange('pinCode', e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Street Address
                      </label>
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Line 1"
                        value={contactForm.streetAddress1}
                        onChange={(e) => handleContactFormChange('streetAddress1', e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Line 2"
                        value={contactForm.streetAddress2}
                        onChange={(e) => handleContactFormChange('streetAddress2', e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Landmark <span className="text-muted">(optional)</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="E.g, Behind Cinema"
                        value={contactForm.landmark}
                        onChange={(e) => handleContactFormChange('landmark', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Details Section */}
                <div className="mb-4">
                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-telephone me-2" style={{ fontSize: '20px' }}></i>
                    <h6 className="mb-0 fw-semibold">Contact Details</h6>
                  </div>
                  <p className="text-muted" style={{ fontSize: '13px' }}>
                    Please provide phone number and email address for online contact.
                  </p>
                  
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Contact Number(s)
                      </label>
                      <div className="d-flex gap-2">
                        <select 
                          className="form-control" 
                          style={{ width: '120px' }}
                          value={contactForm.countryCode}
                          onChange={(e) => handleContactFormChange('countryCode', e.target.value)}
                        >
                          <option value="+66">+66-TH</option>
                          <option value="+1">+1-US</option>
                          <option value="+44">+44-UK</option>
                          <option value="+91">+91-IN</option>
                          <option value="+65">+65-SG</option>
                          <option value="+60">+60-MY</option>
                        </select>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Phone Number"
                          value={contactForm.phone}
                          onChange={(e) => handleContactFormChange('phone', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Contact Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={contactForm.email}
                        onChange={(e) => handleContactFormChange('email', e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label" style={{ fontSize: '13px', fontWeight: 500 }}>
                        Trip Destinations
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Thailand, Malaysia"
                        value={contactForm.destinations}
                        onChange={(e) => handleContactFormChange('destinations', e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="contactPrimary"
                          checked={contactForm.isPrimary}
                          onChange={(e) => handleContactFormChange('isPrimary', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="contactPrimary">
                          Set as Primary Address
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-light" onClick={() => setShowContactModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={saveContactAddress}>
                  Save Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySettings;
