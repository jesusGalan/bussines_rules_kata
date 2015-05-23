


var EmailSender = function () {
	return {
		sendActivationEmail: function () {},
		sendUpgradeEmail: function() {}
	}
}

var PaymentProcessor = function (emailSender) {
	var that = {}

	that.process = function (product, upgrade) {
	  if (isPhysical(product)) {
		  return processPhysicalProduct(product);
		}

		return processMembership(product, upgrade);
	}

	var processPhysicalProduct = function (product) {
		return {
			"book": ["shipping_packing_slip", "royalty_packing_slip", "agent_comission"],

			"Learning_Ski_video": {"shipping_packing_slip": "First_Aid_video"},

			"physical_product": ["shipping_packing_slip", "agent_comission"],
		}[product];
	}

	var processMembership = function (product, upgrade) {
		product.active = true;
		emailSender.sendActivationEmail(product.email);

		if (upgrade) {
			emailSender.sendUpgradeEmail(product.email);
			product.amount = upgrade.amount;
		}

		return [];
	}

	var isPhysical = function (product) {
		return typeof(product) === "string";
	}

	return that;
}