window.PopupWindow = function(config) {
    const popupClosedEventWatchingInterval = 500; // ms
    const moduleName = 'PopupWindow';
    const defaultUrl = 'about:blank';
    const features = {
        width: 500, // px
        height: 500, // px
        toolbar: false, // no
        menubar: false, // no
        scrollbars: true, // yes
        resizable: false, // no
        location: false, // no
        directories: false, // no
        status: false, // no
    };

    let popup = null;
    let timer = null;
    let isSilentMode = false;

    (function(cfg) {
        if (typeof cfg !== 'object') {
            cfg = {};
        }

        if (typeof cfg.name !== 'string') {
            cfg.name = 'nonamed';
        }

        if (typeof cfg.url !== 'string') {
            cfg.url = defaultUrl;
        }

        if (typeof cfg.onBeforeOpen !== 'function') {
            cfg.onBeforeOpen = function() {};
        }

        if (typeof cfg.onAfterOpen !== 'function') {
            cfg.onAfterOpen = function() {};
        }

        if (typeof cfg.onAfterClose !== 'function') {
            cfg.onAfterClose = function() {};
        }
    })(config);

    const onBeforeOpen = function() {
        config.onBeforeOpen();
        console.debug(`${moduleName}: onBeforeOpen`);
    };

    const onAfterOpen = function() {
        config.onAfterOpen();
        console.debug(`${moduleName}: onAfterOpen`);
    };

    const onAfterClose = function() {
        if (isSilentMode === true) {
            isSilentMode = false;
            console.debug(`${moduleName}: ClosedSilently`);
            return;
        }

        config.onAfterClose();
        console.debug(`${moduleName}: Closed`);
    };

    const setFeature = function(key, value) {
        features[key] = value;
    };

    const makeFeaturesString = function() {
        const strings = [];

        for (let key in features) {
            strings[strings.length] = `${key}=${features[key]}`;
        }

        return strings.join(',');
    };

    const isOpened = function() {
        return popup !== null && timer !== null;
    };

    const getName = function() {
        return config.name;
    };

    const focus = function() {
        if (isOpened()) {
            popup.focus();
            return true;
        }

        return false;
    };

    const open = function() {
        if (isOpened()) {
            popup.focus();
            return false;
        }

        onBeforeOpen();

        const featuresString = makeFeaturesString();

        if (config.form) {
            popup = window.open(defaultUrl, config.name, featuresString);

            let defaultTarget = config.form.target;
            config.form.target = config.name;
            config.form.action = config.url;
            config.form.submit();
            config.form.target = defaultTarget;
        } else {
            popup = window.open(config.url, config.name, featuresString);
        }

        if (popup === null) {
            return false;
        }

        timer = setInterval(function() {
            if (!popup.closed) {
                return;
            }

            clearInterval(timer);
            timer = null;
            popup = null;

            onAfterClose();
        }, popupClosedEventWatchingInterval);

        popup.focus();
        onAfterOpen();

        return true;
    };

    const close = function() {
        if (isOpened()) {
            popup.window.close();
        }
    };

    /**
     * Close the PopupWindow opened without calling onAfterClose()
     */
    const closeSilently = function() {
        isSilentMode = true;
        close();
    };

    return {
        open: open,
        close: close,
        closeSilently: closeSilently,
        isOpened: isOpened,
        isClosed: function () {
            return !isOpened();
        },
        focus: focus,
        getName: getName,
        setFeature: setFeature,
    };
};
