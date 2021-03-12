// Initialise the empty users array
users = [];

// Custom validation for registration form
function CustomValidation(input) {
	this.invalidities = [];
	this.validityChecks = [];
	this.inputNode = input;
	this.registerListener();
}

// Custom validation prototypes
CustomValidation.prototype = {
	addInvalidity: function(message) {
		this.invalidities.push(message);
	},
	getInvalidities: function() {
		return this.invalidities.join('. \n');
	},
	checkValidity: function(input) {
		for ( var i = 0; i < this.validityChecks.length; i++ ) {

			var isInvalid = this.validityChecks[i].is_invalid(input);
			if (isInvalid) {
				this.addInvalidity(this.validityChecks[i].invalidityMessage);
			}

			var requirementElement = this.validityChecks[i].element;

			if (requirementElement) {
				if (isInvalid) {
					requirementElement.addClass('invalid');
					requirementElement.removeClass('valid');
				} else {
					requirementElement.removeClass('invalid');
					requirementElement.addClass('valid');
				}

			}
		}
	},
	checkInput: function() {

		this.inputNode.CustomValidation.invalidities = [];
        var element = this.inputNode[0];
		this.checkValidity(this.inputNode);

		if (this.inputNode.CustomValidation.invalidities.length === 0) {
			element.setCustomValidity('');
            return true;
		} else {
			var message = this.inputNode.CustomValidation.getInvalidities();
			element.setCustomValidity(message);
            return false;
		}
	},
	registerListener: function() {

		var CustomValidation = this;

		this.inputNode.on('keyup change', function() {
			CustomValidation.checkInput();
		});
	}
};

var usernameValidityChecks = [
    {
        is_invalid: function(input) {
            return (input.val().length < 5);
        },
        invalidityMessage: "This field must have at least 5 characters",
        element: $('.registration-form input[name=username]').siblings('.input-requirements').children('li').eq(0)
    },
    {
        is_invalid: function(input) {
            for (var i=0;i<users.length;i++) {
                if (users[i] == input.val()) {
                    return true;
                }
            }
            return false;
        },
        invalidityMessage: "This username is already taken",
        element: $('.registration-form input[name=username]').siblings('.input-requirements').children('li').eq(1)
    },
];

function validate() {
    var is_valid = true;
	for (var i = 0; i < inputs.length; i++) {
		is_valid = is_valid && inputs[i].CustomValidation.checkInput();
	}
    return is_valid;
}

// Validity checks for username change input field on the portfolio page
var usernameChangeValidityChecks = [
    {
        is_invalid: function(input) {
            return (input.val().length < 5);
        },
        invalidityMessage: "This field must have at least 5 characters",
        element: $('.change-username-form input[name=username]').siblings('.input-requirements').children('li').eq(0)
    },
    {
        is_invalid: function(input) {
            for (var i=0;i<users.length;i++) {
                if (users[i] == input.val()) {
                    return true;
                }
            }
            return false;
        },
        invalidityMessage: "This username is already taken",
        element: $('.change-username-form input[name=username]').siblings('.input-requirements').children('li').eq(1)
    },
];

// For the username change form
var usernameChangeInput = $('.change-username-form input[name=username]');

usernameChangeInput.CustomValidation = new CustomValidation(usernameChangeInput);
usernameChangeInput.CustomValidation.validityChecks = usernameChangeValidityChecks;
