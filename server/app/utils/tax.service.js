exports.getTaxRate = (province) => {
    let taxInfo = taxes.find(target => target.province === province);
    
    if(taxInfo) {
      return taxInfo.totalTaxRate;
    }    
    return 0;
  }

  const taxes = [
    {province: "AB", rateType: "GST", totalTaxRate: .05},
    {province: "BC", rateType: "GST+PST", totalTaxRate: .12 },
    {province: "MB", rateType: "GST+PST", totalTaxRate: .13},
    {province: "NB", rateType: "HST", totalTaxRate: .15},
    {province: "NL", rateType: "HST", totalTaxRate: .15},
    {province: "NS", rateType: "HST", totalTaxRate: .15},
    {province: "NT", rateType: "GST", totalTaxRate: .05},  
    {province: "NU", rateType: "GST", totalTaxRate: .05},
    {province: "ON", rateType: "HST", totalTaxRate: .13},
    {province: "PE", rateType: "HST", totalTaxRate: .15},
    {province: "QC", rateType: "GST+QST", totalTaxRate: .14975},
    {province: "SK", rateType: "GST+PST", totalTaxRate: .11},
    {province: "YT", rateType: "GST", totalTaxRate: .05},                      
  ];