const addressService = {
  getAddresses: function() {
    const saved = localStorage.getItem('truecycle_addresses');
    return saved ? JSON.parse(saved) : [];
  },
  
  saveAddress: function(address) {
    const addresses = this.getAddresses();
    if (address.id) {
       const idx = addresses.findIndex(a => a.id === address.id);
       if (idx > -1) addresses[idx] = address;
    } else {
       address.id = 'addr_' + Date.now();
       addresses.push(address);
    }
    localStorage.setItem('truecycle_addresses', JSON.stringify(addresses));
    return address;
  },

  deleteAddress: function(id) {
    const addresses = this.getAddresses().filter(a => a.id !== id);
    localStorage.setItem('truecycle_addresses', JSON.stringify(addresses));
  },

  getSelectedAddress: function() {
    const id = localStorage.getItem('truecycle_selected_address');
    const addresses = this.getAddresses();
    return addresses.find(a => a.id === id) || addresses[0] || null;
  },

  setSelectedAddress: function(id) {
    localStorage.setItem('truecycle_selected_address', id);
  }
};
