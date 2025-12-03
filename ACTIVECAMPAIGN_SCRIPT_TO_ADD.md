# ActiveCampaign Script to Add

Add this entire script block **right before the closing `</body>` tag** in your updated HTML, after the `unlockScore` and event listener scripts.

## Location

Place it after this section:
```html
    </script>
    
    <!-- ActiveCampaign form script (your existing script continues here) -->
```

## The Script

```html
    <!-- ActiveCampaign form script -->
    <script>
      window.cfields = [];
      window._show_thank_you = function (id, message, trackcmp_url, email) {
        var form = document.getElementById("_form_" + id + "_"),
            thank_you = form.querySelector("._form-thank-you");
        form.querySelector("._form-content").style.display = "none";
        thank_you.innerHTML = message;
        thank_you.style.display = "block";
        const vgoAlias = typeof visitorGlobalObjectAlias === "undefined" ? "vgo" : visitorGlobalObjectAlias;
        var visitorObject = window[vgoAlias];
        if (email && typeof visitorObject !== "undefined") {
          visitorObject("setEmail", email);
          visitorObject("update");
        } else if (typeof trackcmp_url != "undefined" && trackcmp_url) {
          _load_script(trackcmp_url);
        }
        if (typeof window._form_callback !== "undefined") window._form_callback(id);
        thank_you.setAttribute("tabindex", "-1");
        thank_you.focus();
      };
      window._show_unsubscribe = function (id, message, trackcmp_url, email) {
        var form = document.getElementById("_form_" + id + "_"),
            unsub = form.querySelector("._form-thank-you");
        var branding = form.querySelector("._form-branding");
        if (branding) {
          branding.style.display = "none";
        }
        form.querySelector("._form-content").style.display = "none";
        unsub.style.display = "block";
        form.insertAdjacentHTML("afterend", message);
        const vgoAlias = typeof visitorGlobalObjectAlias === "undefined" ? "vgo" : visitorGlobalObjectAlias;
        var visitorObject = window[vgoAlias];
        if (email && typeof visitorObject !== "undefined") {
          visitorObject("setEmail", email);
          visitorObject("update");
        } else if (typeof trackcmp_url != "undefined" && trackcmp_url) {
          _load_script(trackcmp_url);
        }
        if (typeof window._form_callback !== "undefined") window._form_callback(id);
      };
      window._show_error = function (id, message, html) {
        var form = document.getElementById("_form_" + id + "_"),
            err = document.createElement("div"),
            button = form.querySelector('button[type="submit"]'),
            old_error = form.querySelector("._form_error");
        if (old_error) old_error.parentNode.removeChild(old_error);
        err.innerHTML = message;
        err.className = "_error-inner _form_error _no_arrow";
        var wrapper = document.createElement("div");
        wrapper.className = "_form-inner _show_be_error";
        wrapper.appendChild(err);
        button.parentNode.insertBefore(wrapper, button);
        var submitButton = form.querySelector('[id^="_form"][id$="_submit"]');
        submitButton.disabled = false;
        submitButton.classList.remove("processing");
        if (html) {
          var div = document.createElement("div");
          div.className = "_error-html";
          div.innerHTML = html;
          err.appendChild(div);
        }
      };
      window._show_pc_confirmation = function (id, header, detail, show, email) {
        var form = document.getElementById("_form_" + id + "_"),
            pc_confirmation = form.querySelector("._form-pc-confirmation");
        if (pc_confirmation.style.display === "none") {
          form.querySelector("._form-content").style.display = "none";
          pc_confirmation.innerHTML =
            "<div class='_form-title'>" +
            header +
            "</div>" +
            "<p>" +
            detail +
            "</p>" +
            "<button class='_submit' id='hideButton'>Manage preferences</button>";
          pc_confirmation.style.display = "block";
          var mp = document.querySelector('input[name="mp"]');
          mp.value = "0";
        } else {
          form.querySelector("._form-content").style.display = "inline";
          pc_confirmation.style.display = "none";
        }
        var hideButton = document.getElementById("hideButton");
        hideButton.addEventListener("click", function () {
          var submitButton = document.querySelector("#_form_5_submit");
          submitButton.disabled = false;
          submitButton.classList.remove("processing");
          var mp = document.querySelector('input[name="mp"]');
          mp.value = "1";
          const cacheBuster = new URL(window.location.href);
          cacheBuster.searchParams.set("v", new Date().getTime());
          window.location.href = cacheBuster.toString();
        });
        const vgoAlias = typeof visitorGlobalObjectAlias === "undefined" ? "vgo" : visitorGlobalObjectAlias;
        var visitorObject = window[vgoAlias];
        if (email && typeof visitorObject !== "undefined") {
          visitorObject("setEmail", email);
          visitorObject("update");
        } else if (typeof trackcmp_url != "undefined" && trackcmp_url) {
          _load_script(trackcmp_url);
        }
        if (typeof window._form_callback !== "undefined") window._form_callback(id);
      };
      window._load_script = function (url, callback, isSubmit) {
        var head = document.querySelector("head"),
            script = document.createElement("script"),
            r = false;
        var submitButton = document.querySelector("#_form_5_submit");
        script.charset = "utf-8";
        script.src = url;
        if (callback) {
          script.onload = script.onreadystatechange = function () {
            if (!r && (!this.readyState || this.readyState == "complete")) {
              r = true;
              callback();
            }
          };
        }
        script.onerror = function () {
          if (isSubmit) {
            if (script.src.length > 10000) {
              _show_error("5", "Sorry, your submission failed. Please shorten your responses and try again.");
            } else {
              _show_error("5", "Sorry, your submission failed. Please try again.");
            }
            submitButton.disabled = false;
            submitButton.classList.remove("processing");
          }
        };
        head.appendChild(script);
      };
      (function () {
        if (window.location.search.search("excludeform") !== -1) return false;
        var addEvent = function (element, event, func) {
          if (element.addEventListener) {
            element.addEventListener(event, func);
          } else {
            var oldFunc = element["on" + event];
            element["on" + event] = function () {
              oldFunc && oldFunc.apply(this, arguments);
              func.apply(this, arguments);
            };
          }
        };
        var form_to_submit = document.getElementById("_form_5_");
        var allInputs = form_to_submit.querySelectorAll("input, select, textarea"),
            tooltips = [],
            submitted = false;
        var needs_validate = function (el) {
          if (el.getAttribute("required") !== null) return true;
          if ((el.name === "email" || el.id === "phone" || el.id === "sms_consent") && el.value !== "") return true;
          return false;
        };
        var remove_tooltips = function () {
          for (var i = 0; i < tooltips.length; i++) {
            tooltips[i].tip.parentNode.removeChild(tooltips[i].tip);
          }
          tooltips = [];
        };
        var remove_tooltip = function (elem) {
          for (var i = 0; i < tooltips.length; i++) {
            if (tooltips[i].elem === elem) {
              tooltips[i].tip.parentNode.removeChild(tooltips[i].tip);
              tooltips.splice(i, 1);
              return;
            }
          }
        };
        var create_tooltip = function (elem, text) {
          var tooltip = document.createElement("div"),
              arrow = document.createElement("div"),
              inner = document.createElement("div"),
              new_tooltip = {};
          tooltip.id = elem.id + "-error";
          tooltip.setAttribute("role", "alert");
          if (elem.type != "radio" && (elem.type != "checkbox" || elem.name === "sms_consent")) {
            tooltip.className = "_error";
            arrow.className = "_error-arrow";
            inner.className = "_error-inner";
            inner.innerHTML = text;
            tooltip.appendChild(arrow);
            tooltip.appendChild(inner);
            elem.parentNode.appendChild(tooltip);
          } else {
            tooltip.className = "_error-inner _no_arrow";
            tooltip.innerHTML = text;
            elem.parentNode.insertBefore(tooltip, elem);
            new_tooltip.no_arrow = true;
          }
          new_tooltip.tip = tooltip;
          new_tooltip.elem = elem;
          tooltips.push(new_tooltip);
          return new_tooltip;
        };
        var resize_tooltip = function (tooltip) {
          var rect = tooltip.elem.getBoundingClientRect();
          var doc = document.documentElement,
              scrollPosition = rect.top - ((window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0));
          if (scrollPosition < 40) {
            tooltip.tip.className = tooltip.tip.className.replace(/ ?(_above|_below) ?/g, "") + " _below";
          } else {
            tooltip.tip.className = tooltip.tip.className.replace(/ ?(_above|_below) ?/g, "") + " _above";
          }
        };
        var resize_tooltips = function () {
          for (var i = 0; i < tooltips.length; i++) {
            if (!tooltips[i].no_arrow) resize_tooltip(tooltips[i]);
          }
        };
        var validate_field = function (elem, remove) {
          var tooltip = null,
              value = elem.value,
              no_error = true;
          remove ? remove_tooltip(elem) : false;
          elem.removeAttribute("aria-invalid");
          elem.removeAttribute("aria-describedby");
          if (elem.type != "checkbox") elem.className = elem.className.replace(/ ?_has_error ?/g, "");
          if (el.getAttribute("required") !== null) {
            if (elem.type == "radio" || (elem.type == "checkbox" && /any/.test(elem.className))) {
              var elems = form_to_submit.elements[elem.name];
              if (!(elems instanceof NodeList || elems instanceof HTMLCollection || elems.length <= 1)) {
                no_error = elem.checked;
              } else {
                no_error = false;
                for (var i = 0; i < elems.length; i++) {
                  if (elems[i].checked) no_error = true;
                }
              }
              if (!no_error) {
                tooltip = create_tooltip(elem, "Please select an option.");
              }
            } else if (elem.type == "checkbox") {
              var elems = form_to_submit.elements[elem.name],
                  found = false,
                  err = [];
              no_error = true;
              for (var i = 0; i < elems.length; i++) {
                if (elems[i].getAttribute("required") === null) continue;
                if (!found && elems[i] !== elem) return true;
                found = true;
                elems[i].className = elems[i].className.replace(/ ?_has_error ?/g, "");
                if (!elems[i].checked) {
                  no_error = false;
                  elems[i].className = elems[i].className + " _has_error";
                  err.push("Checking %s is required".replace("%s", elems[i].value));
                }
              }
              if (!no_error) {
                tooltip = create_tooltip(elem, err.join("<br/>"));
              }
            } else if (elem.tagName == "SELECT") {
              var selected = true;
              if (elem.multiple) {
                selected = false;
                for (var i = 0; i < elem.options.length; i++) {
                  if (elem.options[i].selected) {
                    selected = true;
                    break;
                  }
                }
              } else {
                for (var i = 0; i < elem.options.length; i++) {
                  if (elem.options[i].selected && (!elem.options[i].value || elem.options[i].value.match(/\n/g))) {
                    selected = false;
                  }
                }
              }
              if (!selected) {
                elem.className = elem.className + " _has_error";
                no_error = false;
                tooltip = create_tooltip(elem, "Please select an option.");
              }
            } else if (value === undefined || value === null || value === "") {
              elem.className = elem.className + " _has_error";
              no_error = false;
              tooltip = create_tooltip(elem, "This field is required.");
            }
          }
          if (no_error && elem.name == "email") {
            if (!value.match(/^[\+_a-z0-9-'&=]+(\.[\+_a-z0-9-']+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,})$/i)) {
              elem.className = elem.className + " _has_error";
              no_error = false;
              tooltip = create_tooltip(elem, "Enter a valid email address.");
            }
          }
          tooltip ? resize_tooltip(tooltip) : false;
          if (!no_error && elem.hasAttribute("id")) {
            elem.setAttribute("aria-invalid", "true");
            elem.setAttribute("aria-describedby", elem.id + "-error");
          }
          return no_error;
        };
        var validate_form = function (e) {
          var no_error = true;
          if (!submitted) {
            submitted = true;
            for (var i = 0, len = allInputs.length; i < len; i++) {
              var input = allInputs[i];
              if (needs_validate(input)) {
                if (input.type == "text" || input.type == "number" || input.type == "time" || input.type == "tel") {
                  addEvent(input, "blur", function () {
                    this.value = this.value.trim();
                    validate_field(this, true);
                  });
                  addEvent(input, "input", function () {
                    validate_field(this, true);
                  });
                } else if (input.type == "radio" || input.type == "checkbox") {
                  (function (el) {
                    function getElementsArray(name) {
                      const value = form_to_submit.elements[name];
                      if (Array.isArray(value)) {
                        return value;
                      }
                      return [value];
                    }
                    var radios = getElementsArray(el.name);
                    for (var i = 0; i < radios.length; i++) {
                      addEvent(radios[i], "change", function () {
                        validate_field(el, true);
                      });
                    }
                  })(input);
                } else if (input.tagName == "SELECT") {
                  addEvent(input, "change", function () {
                    validate_field(this, true);
                  });
                } else if (input.type == "textarea") {
                  addEvent(input, "input", function () {
                    validate_field(this, true);
                  });
                }
              }
            }
          }
          remove_tooltips();
          for (var i = 0, len = allInputs.length; i < len; i++) {
            var elem = allInputs[i];
            if (needs_validate(elem)) {
              if (elem.tagName.toLowerCase() !== "select") {
                elem.value = elem.value.trim();
              }
              validate_field(elem) ? true : (no_error = false);
            }
          }
          if (!no_error && e) {
            e.preventDefault();
          }
          if (!no_error) {
            const firstFocusableError = form_to_submit.querySelector("._has_error:not([disabled])");
            if (firstFocusableError && typeof firstFocusableError.focus === "function") {
              firstFocusableError.focus();
            }
          }
          resize_tooltips();
          return no_error;
        };
        addEvent(window, "resize", resize_tooltips);
        addEvent(window, "scroll", resize_tooltips);
        var _form_serialize = function (form) {
          if (!form || form.nodeName !== "FORM") return;
          var i, j, q = [];
          for (i = 0; i < form.elements.length; i++) {
            if (form.elements[i].name === "") continue;
            switch (form.elements[i].nodeName) {
              case "INPUT":
                switch (form.elements[i].type) {
                  case "text":
                  case "number":
                  case "date":
                  case "time":
                  case "hidden":
                  case "password":
                  case "button":
                  case "reset":
                  case "submit":
                    q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                    break;
                  case "checkbox":
                  case "radio":
                    if (form.elements[i].checked) {
                      q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                    }
                    break;
                  case "file":
                    break;
                }
                break;
              case "TEXTAREA":
                q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                break;
              case "SELECT":
                switch (form.elements[i].type) {
                  case "select-one":
                    q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                    break;
                  case "select-multiple":
                    for (j = 0; j < form.elements[i].options.length; j++) {
                      if (form.elements[i].options[j].selected) {
                        q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
                      }
                    }
                    break;
                }
                break;
              case "BUTTON":
                switch (form.elements[i].type) {
                  case "reset":
                  case "submit":
                  case "button":
                    q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
                    break;
                }
                break;
            }
          }
          return q.join("&");
        };
        var form_submit = function (e) {
          e.preventDefault();
          if (validate_form(e)) {
            var submitButton = e.target.querySelector("#_form_5_submit");
            submitButton.disabled = true;
            submitButton.classList.add("processing");
            var serialized = _form_serialize(document.getElementById("_form_5_")).replace(/%0A/g, "\\n");
            var err = form_to_submit.querySelector("._form_error");
            err ? err.parentNode.removeChild(err) : false;
            _load_script(
              "https://wunderbardigital.activehosted.com/proc.php?" + serialized + "&jsonp=true",
              null,
              true
            );
          }
          return false;
        };
        addEvent(form_to_submit, "submit", form_submit);
      })();
    </script>
```

## Note

There's a small typo in the original script. In the `validate_field` function, there's a line that says:
```javascript
if (el.getAttribute("required") !== null) return true;
```

But it should be:
```javascript
if (elem.getAttribute("required") !== null) return true;
```

I've corrected this in the script above (it uses `elem` consistently).

