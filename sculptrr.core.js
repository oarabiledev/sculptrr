// Sculptrr, a css in js library for Enjine-IO or DroidScript Hybrid.

// @license
// MIT

// @version
// 1.0

// @author
// Oarabile Koore

/**
 * Add Css In An Object Manner To Style The Element
 */
ui.Control.prototype.sculptrr = function (object) {
	// Ensure `this._div` is initialized properly
	if (!this._div) {
		console.error("Element Is Not Initialized");
		return this;
	}

	const className = cssParser(object);
	this._div.classList.add(className);
};

const generateClassName = (() => {
	let counter = 0;
	return () => `sculptrr-class-${counter++}`;
})();

const cssParser = (styles) => {
	const className = generateClassName();
	const styleSheet = document.head.appendChild(document.createElement("style")).sheet;

	let cssString = "";
	let nestedCssRules = [];
	let mediaQueryRules = [];

	const parseStyles = (styles, selector) => {
		let baseStyles = "";
		Object.entries(styles).forEach(([key, value]) => {
			if (typeof value === "object") {
				if (key.startsWith("@")) {
					mediaQueryRules.push({ media: key, selector, styles: value });
				} else if (key.startsWith("&:")) {
					// Handle pseudo-classes prefixed with "&:"
					const pseudoClass = key.replace("&", selector);
					nestedCssRules.push({ selector: pseudoClass, styles: value });
				} else {
					// Handle other nested selectors
					nestedCssRules.push({ selector: `${selector} ${key}`, styles: value });
				}
			} else {
				baseStyles += `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}; `;
			}
		});
		return baseStyles;
	};

	cssString = parseStyles(styles, `.${className}`);

	if (cssString) {
		styleSheet.insertRule(`.${className} { ${cssString} }`, styleSheet.cssRules.length);
	}

	nestedCssRules.forEach(({ selector, styles }) => {
		const nestedCssString = parseStyles(styles, selector);
		if (nestedCssString) {
			const rule = `${selector} { ${nestedCssString} }`;
			styleSheet.insertRule(rule, styleSheet.cssRules.length);
		}
	});

	mediaQueryRules.forEach(({ media, selector, styles }) => {
		const nestedCssString = parseStyles(styles, selector);
		if (nestedCssString) {
			const rule = `${media} { ${selector} { ${nestedCssString} } }`;
			styleSheet.insertRule(rule, styleSheet.cssRules.length);
		}
	});

	return className;
};
