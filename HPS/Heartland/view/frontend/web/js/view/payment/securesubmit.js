

var getImageURL = (function () {
    //build a relative path based on the module location on the configured server
    var scripts = document.getElementsByTagName('script');
    var element = scripts[scripts.length-1];
    if (element !== null) {
        var myScript = element.src.split('/').slice(0, -4).join('/') + '/images/';
        //console.log(myScript);
        return function () {
            return myScript;
        };
    }
})();

function _HPS_addClass(element, klass)
{
    if (element !== null && element.className.indexOf(klass) === -1) {
        element.className = element.className + ' ' + klass;
    }
}

function _HPS_removeClass(element, klass)
{
    if (element !== null && element.className.indexOf(klass) === -1) {
        return;
    }
    element.className = element.className.replace(klass, '');
}

function setElementValue(selector, propertyToSet, valueToSet)
{
    var element = document.querySelector(selector);
    if (element !== null) {
        switch (propertyToSet.toLowerCase()) {
            case 'value':
                element.value = valueToSet;
                break;
            case 'disabled':
                element.disabled = valueToSet;
                break;
            case 'innerhtml':
                element.innerHTML = valueToSet;
                break;
        }
    }
}

function _HPS_setHssTransaction(response)
{
    setElementValue('#securesubmit_token', 'value', response.token_value.trim());
    setElementValue('#hps_heartland_cc_number', 'value', response.last_four.trim());
    setElementValue('#hps_heartland_cc_type', 'value', response.card_type.trim());
    setElementValue('#hps_heartland_expiration', 'value', response.exp_month.trim());
    setElementValue('#hps_heartland_expiration_yr', 'value', response.exp_year.trim());
    //document.querySelector('#bPlaceOrderNow').click();
}

function _HPS_DisablePlaceOrder()
{
    try {
        var element = '#checkout-payment-method-load > div > div.payment-method._active > div.payment-method-content > div.actions-toolbar > div > button';
        _HPS_addClass(document.querySelector(element), 'disabled');
        setElementValue('#bPlaceOrderNow', 'disabled', true);
        setElementValue('#bPlaceOrderNow', 'disabled', 'disabled');
    } catch (e) {
    }
}
function _HPS_EnablePlaceOrder()
{
    try {
        var element = '#checkout-payment-method-load > div > div.payment-method._active > div.payment-method-content > div.actions-toolbar > div > button';
        _HPS_removeClass(document.querySelector(element), 'disabled');
        setElementValue('#bPlaceOrderNow', 'disabled', false);
        setElementValue('#bPlaceOrderNow', 'disabled', '');
    } catch (e) {
    }
}
function HPS_SecureSubmit(document, Heartland, publicKey)
{
    //if (arguments.callee.count > 0 )
    //    return;
    if (document.querySelector('#iframesCardNumber') // dont execute if this doesnt exist
            && !document.querySelector('#heartland-frame-cardNumber') //dont execute if this exists
            && publicKey) {
        //var addHandler = Heartland.Events.addHandler;
        function enablePlaceOrder(disabled)
        {
            var element = '#checkout-payment-method-load > div > div.payment-method._active > div.payment-method-content > div.actions-toolbar > div > button';
            try {
                _HPS_removeClass(document.querySelector(element), 'disabled');
            } catch (e) {
            }
            if (!disabled) {
                try {
                    _HPS_addClass(document.querySelector(element), 'disabled');
                } catch (e) {
                }
            }
        }
        enablePlaceOrder(false);


        function toAll(elements, fun)
        {
            var i = 0;
            var length = elements.length;
            for (i; i < length; i++) {
                fun(elements[i]);
            }
        }

        function filter(elements, fun)
        {
            var i = 0;
            var length = elements.length;
            var result = [];
            for (i; i < length; i++) {
                if (fun(elements[i]) === true) {
                    result.push(elements[i]);
                }
            }
            return result;
        }

        function clearFields()
        {
            toAll(document.querySelectorAll('.magento2_error, .magento2-error, .magento2-message, .magento2_message'), function (element) {
                element.remove();
            });
        }


        // Handles tokenization response
        function responseHandler(response)
        {
            var getrequireval = document.querySelector('#requirecvvexp');
            var requirecvvexpval = getrequireval.value;
            if (document.querySelector('#heartland-frame-cardNumber') != null) {
                toAll(document.querySelectorAll('#iframesCardNumber > div, #heartland-frame-cardNumber, #heartland-frame-cardExpiration, #heartland-frame-cardCvv'), function (element) {
                    try {
                        element.remove();
                    } catch (e) {
                    }
                });
                document.querySelector('#iframes > input[type="submit"]').style.display = 'none';
                try {
                    _HPS_addClass(document.querySelector('#iframesCardCvvLabel > span'), 'hideMe');
                } catch (e) {
                }

                var errElement = document.querySelector('#iframesCardError');
                try {
                    errElement.innerText = '';
                } catch (e) {
                }
                try {
                    _HPS_removeClass(errElement, 'mage-error');
                } catch (e) {
                }
                if (response.error) {
                    _HPS_addClass(errElement, 'mage-error');
                    errElement.innerText = response.error.message;
                    // show the form again
                    HPS_SecureSubmit(document, Heartland, publicKey);
                    try {
                        _HPS_removeClass(document.querySelector('#iframesCardCvvLabel > span'), 'hideMe');
                    } catch (e) {
                    }
                    document.querySelector('#iframes > input[type="submit"]').style.display = 'none';
                } else {
                    _HPS_setHssTransaction(response);
                    document.querySelector("#bPlaceOrderNow").click();
                }
            }
        }

        // Load function to attach event handlers when WC refreshes payment fields
        window.securesubmitLoadEvents = function () {
            if (!Heartland) {
                return;
            }

            toAll(document.querySelectorAll('.card-number, .card-cvc, .expiry-date'), function (element) {
                addHandler(element, 'change', clearFields);
            });

            toAll(document.querySelectorAll('.saved-selector'), function (element) {
                addHandler(element, 'click', function (e) {
                    var display = 'none';
                    if (document.getElementById('secure_submit_card_new').checked) {
                        display = 'block';
                    }
                    toAll(document.querySelectorAll('.new-card-content'), function (el) {
                        el.style.display = display;
                    });

                    // Set active flag
                    toAll(document.querySelectorAll('.saved-card'), function (el) {
                        _HPS_removeClass(el, 'active');
                    });
                    _HPS_addClass(element.parentNode.parentNode, 'active');
                });
            });

            if (document.querySelector('.securesubmit_new_card .card-number')) {
                Heartland.Card.attachNumberEvents('.securesubmit_new_card .card-number');
                Heartland.Card.attachExpirationEvents('.securesubmit_new_card .expiry-date');
                Heartland.Card.attachCvvEvents('.securesubmit_new_card .card-cvc');
            }
        };
        window.securesubmitLoadEvents();
        var state = {
            cardNumberValid: false,
            cardCvvValid: false,
            cardExpirationValid: false
          };
        // Create a new `HPS` object with the necessary configuration
        var hps = new Heartland.HPS({
            // Change the publicKey below to match your account's credential.
            // Ensure the publicKey is changed on line 96 as well.
            publicKey: publicKey, //'pkapi_cert_jKc1FtuyAydZhZfbB3',
            type: 'iframe',
            // Configure the iframe fields to tell the library where
            // the iframe should be inserted into the DOM and some
            // basic options
            fields: {
                cardNumber: {
                    target: 'iframesCardNumber',
                    placeholder: '•••• •••• •••• ••••'
                },
                cardExpiration: {

                    target: 'iframesCardExpiration',
                    placeholder: 'MM / YYYY'
                },
                cardCvv: {
                    target: 'iframesCardCvv',
                    placeholder: 'CVV'
                }
            },
            // Collection of CSS to inject into the iframes.
            // These properties can match the site's styles
            // to create a seamless experience.

            style: {
                'input': {
                    'background': '#fff',
                    'border': '1px solid #666',
                    'border-color': '#bbb3b9 #c7c1c6 #c7c1c6',
                    'box-sizing': 'border-box',
                    'font-family': 'Arial, Helvetica Neue, Helvetica, sans-serif',
                    'font-size': '18px !important',
                    'line-height': '18px !important',
                    'margin': '0 .5em 0 0',
                    'max-width': '100%',
                    'outline': '0',
                    'padding': '15px 13px 13px 13px',
                    'vertical-align': 'middle',
                    'width': '100%'
                },
                '#heartland-field-body': {
                    'width': '100%'
                },
                '#heartland-field-wrapper': {
                    'position': 'relative'
                },
                // Card Number
                '#heartland-field[name="cardNumber"] + .extra-div-1': {
                    'display': 'block',
                    'width': '56px',
                    'height': '44px',
                    'position': 'absolute',
                    'top': '4px',
                    'right': '10px',
                    'background-position': 'bottom',
                    'background-repeat': 'no-repeat',
                    'background-size': '56px auto'
                },
                '#heartland-field[name="cardNumber"].valid + .extra-div-1': {
                    'background-position': 'top'
                },
                '#heartland-field.card-type-visa + .extra-div-1': {
                    'background-image': 'url("' + getImageURL() + 'ss-inputcard-visa@2x.png")'
                },
                '#heartland-field.card-type-jcb + .extra-div-1': {
                    'background-image': 'url("' + getImageURL() + 'ss-inputcard-jcb@2x.png")'
                },
                '#heartland-field.card-type-discover + .extra-div-1': {
                    'background-image': 'url("' + getImageURL() + 'ss-inputcard-discover@2x.png")'
                },
                '#heartland-field.card-type-amex + .extra-div-1': {
                    'background-image': 'url("' + getImageURL() + 'ss-inputcard-amex@2x.png")'
                },
                '#heartland-field.card-type-mastercard + .extra-div-1': {
                    'background-image': 'url("' + getImageURL() + 'ss-inputcard-mastercard@2x.png")'
                },
                '@media only screen and (max-width : 290px)': {
                    '#heartland-field[name="cardNumber"] + .extra-div-1': {
                        'display': 'none'
                    }
                },
                // Card CVV
                '#heartland-field[name="cardCvv"] + .extra-div-1': {
                    'display': 'block',
                    'width': '59px',
                    'height': '39px',
                    'background-image': 'url("' + getImageURL() + 'ss-cvv@2x.png")',
                    'background-size': '59px auto',
                    'background-position': 'top',
                    'position': 'absolute',
                    'top': '6px',
                    'right': '7px'
                }
            },

            onTokenSuccess: responseHandler,
            onTokenError: responseHandler,
            onEvent: function (event) {
                state[event.source + 'Valid'] = event.classes.indexOf('valid') !== -1;
            }
            /*
             // Callback when a token is received from the service
             onTokenSuccess: function (resp) {
             console.log('Here is a single-use token: ' + resp.token_value);
             },
             // Callback when an error is received from the service
             onTokenError: function (resp) {
             console.log('There was an error: ' + resp.error.message);
             }*/
        });
        // Attach a handler to interrupt the form submission
        Heartland.Events.addHandler(document.getElementById('iframes'), 'submit', function (e) {
           
            // Prevent the form from continuing to the `action` address
            e.preventDefault();
            var getrequireval = document.querySelector('#requirecvvexp');
            var requirecvvexpval = getrequireval.value; 
            var errElement = document.querySelector('#iframesCardError');
            
            if (state.cardNumberValid == false) {
                _HPS_addClass(errElement, 'mage-error');
                errElement.innerText = 'Card number is undefined';
                document.querySelector('#iframes > input[type="submit"]').style.display = 'none';
            }
            if (requirecvvexpval == 'yes' && state.cardExpirationValid == false) {
                _HPS_addClass(errElement, 'mage-error');
                errElement.innerText = 'Invalid Expiration Date.';
                document.querySelector('#iframes > input[type="submit"]').style.display = 'none';
            }
            else if (requirecvvexpval == 'yes' && state.cardCvvValid == false) {
                _HPS_addClass(errElement, 'mage-error');
                errElement.innerText = 'Invalid CVV.';
                document.querySelector('#iframes > input[type="submit"]').style.display = 'none';
            }
            else{ 
                // Tell the iframes to tokenize the data
                hps.Messages.post(
                        {
                            accumulateData: true,
                            action: 'tokenize',
                            message: publicKey, //'pkapi_cert_jKc1FtuyAydZhZfbB3',
                        },
                        'cardNumber'
                        );
            }
           
        });
    }
}
;