describe("Bussines rules (http://codekata.com/kata/kata16-business-rules)", function () {
	var paymentProcessor, emailSender;

	beforeEach(function () {
		emailSender = EmailSender();
		spyOn(emailSender, "sendActivationEmail");
		spyOn(emailSender, "sendUpgradeEmail");
		paymentProcessor = PaymentProcessor(emailSender);
	});

	describe("Pagando por un producto fisico", function () {
		it('debe retornar 1 shipping_packing_slip', function () {
			var result = paymentProcessor.process("physical_product");

			expect(result).toContain("shipping_packing_slip");
		});

		it("debe generar una comisión de pagos para el agente", function() {
			var result = paymentProcessor.process("physical_product");

			expect(result).toContain("agent_comission");
		});
	});

	describe("Pagando por un libro", function () {
		it('debe retornar packing_slip por duplicado', function (){
			var result = paymentProcessor.process("book");

			expect(result).toContain("shipping_packing_slip", "royalty_packing_slip");

		});
		it("debe generar una comisión de pagos para el agente", function() {
			var result = paymentProcessor.process("book");

			expect(result).toContain("agent_comission");
		});
	});

	describe("Pagando por una membresia", function () {
		var membership;

		beforeEach(function() {
			membership =  {active: false, email : "owner@hippie.es"};
		});

		it('debe activar el membership', function () {
			paymentProcessor.process(membership, null);

			expect(membership.active).toEqual(true);
		});

		it('no debe devolver un packing slip', function () {
			var result = paymentProcessor.process(membership, null);

			expect(result).toEqual([]);
		});

		it("debe enviar un email", function(){
			paymentProcessor.process(membership, null);

			expect(emailSender.sendActivationEmail).toHaveBeenCalledWith(membership.email);
		});
	});

	describe("Actualizando una membresia", function () {
		beforeEach(function() {
			membership =  {active: false, amount: 100, email : "owner@hippie.es"};
			paymentProcessor.process(membership, null);
		});

		it("debe a actualizar la membresia", function () {
			paymentProcessor.process(membership, {amount: 200});

			expect(membership.amount).toEqual(200);
		});

		it("debe actualizar la membersia con otro valor", function () {
			paymentProcessor.process(membership, {amount: 600});

			expect(membership.amount).toEqual(600);
		});

		it("debe enviar un email", function(){
			paymentProcessor.process(membership, {amount: 200});

			expect(emailSender.sendUpgradeEmail).toHaveBeenCalledWith(membership.email);
		});
	});

	it("Debe añadir el video gratuito 'First Aid al shipping_packing_slip' si el pago es por el video 'Learning Ski'", function(){
		var result = paymentProcessor.process("Learning_Ski_video")

		expect(result).toEqual({"shipping_packing_slip": "First_Aid_video"})
	});
});


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