///////////////////////////////////////////////////////////////////////////////////////
// Helper functions
///////////////////
//
// Partially apply arguments to a function. Useful for binding
// specific data to an event handler. (from: https://gist.github.com/mindeavor/13d4593b00b4ee7cea33)
// Example use:
//
//   var add = function (x,y) { return x + y; }
//   var add5 = add.papp(5)
//   add5(7) //=> 11
//
Function.prototype.papp = function () {
  var slice = Array.prototype.slice;
  var fn = this;
  var args = slice.call(arguments);
  return function () {
    fn.apply(this, args.concat(slice.call(arguments)))
  }
};
//
var nonJsonErrors = function(xhr) {
  return xhr.status > 200 ? JSON.stringify(xhr.responseText) : xhr.responseText
};
//
String.prototype.hashCode = function() {
    var i, l,
        hval = 0x811c9dc5;
    for (i = 0, l = this.length; i < l; i++) {
        hval ^= this.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
};
///////////////////////////////////////////////////////////////////////////////////////

var errorAlert = function (msg) {
    return m("div", {className: "alert alert-danger"}, [m("strong", l.errors.errorLabel()), msg]);
};

var topBanner = function(notLoaded) {
    notLoaded = notLoaded || false;
    return m("div.row" + (notLoaded ? ".text-center" : ""), m("div.col-sm-12", [
                m("img" + (notLoaded ? ".jfdlogo" : ".jfdlogotop"), {src: "img/logojfdtr.png"}),
                m("h2.apptitle", l.main.talentTitle()),
                m("p", [l.main.talentDesc(), m("a[href='/help']", {config: m.route}, l.main.talentLinkTitle())])
            ]));
};

var languageWidget = function() {
    return m("div", {className: "btn-group top-right"}, [
        m("button", {className: "btn btn-xs " + (l.currentLanguage() == "fr" ? "btn-primary" : "btn-default"), onclick: l.currentLanguage.papp("fr")}, "FR"),
        m("button", {className: "btn btn-xs " + (l.currentLanguage() == "en" ? "btn-primary" : "btn-default"), onclick: l.currentLanguage.papp("en")}, "EN")
    ])
};

var Courses = function() {
    var associates = m.prop({});
    var courses = m.prop([]);
    var error = m.prop("");
    var excluded = m.prop([]);

    return {
        associates: associates,
        courses: courses,
        error: error,
        excluded: excluded,

        getData: function(formdata) {
            return m.request({
                method: "POST",
                url: "/lms/processfile",
                data: formdata,
                serialize: function(value) {return value},
                extract: nonJsonErrors
            })
        },
        clearCourses: function() {
            associates({});
            courses([]);
            excluded([]);
            error("");
        }
    }
};

var LMSapp = {
    controller: function(data) {
        var printBackground = m.prop(false);
        var filterString = m.prop("");

        var getCoursesError = function() {
            data.error(l.errors.serverError());
        };

        var parseTSV = function(tsv) {
            m.startComputation();
            try {
                var ix_end = 0;
                var associates = {};
                var courses = [];

                for (var ix = 0; ix < tsv.length; ix = ix_end + 1) {
                    ix_end = tsv.indexOf("\n", ix);
                    if (ix_end == -1) {
                        ix_end = tsv.length;
                    }
                    var row = tsv.substring(ix, ix_end - 1).split("\t");

                    if (!(/\d+/.test(row[0]))) {
                        continue;
                    }
                    if (!(row[0] in associates)) {
                        associates[row[0]] = {
                            "name": row[1].split(", ").reverse(),
                            "completed": [],
                            "assigned": []
                        }
                    }
                    var course = row[5].replace(/(\s?-?\s?programmes? d\'études)|(\s?-?\s?curriculum)/i, "");
                    var status = "assigned";
                    if (row[8] != "") {
                        status = "completed";
                    }
                    var ic = courses.indexOf(course);
                    if (ic >= 0) {
                        associates[row[0]][status].push(ic);
                    } else {
                        courses.push(course);
                        associates[row[0]][status].push(courses.length - 1);
                    }
                }
                data.courses(courses);
                data.associates(associates);
            }
            catch (e) {
                data.error(l.errors.fileParseError());
            }
            finally {
                m.endComputation();
            }
        };

        var dataEl = document.getElementById("lmsdata");
        if (dataEl) {
            try {
                parseTSV(decodeURIComponent(atob(dataEl.textContent)));
            }
            finally {
                dataEl.parentNode.removeChild(dataEl);
            }
        }

        return {
            associates: data.associates,
            courses: data.courses,
            excluded: data.excluded,
            error: data.error,
            printBackground: printBackground,
            filterString: filterString,

            // We'll keep this one as backup...
            getCoursesFromServer: function(files) {
                if (files.length > 0) {
                    formdata = new FormData;
                    formdata.append("csvfile", files[0]);
                    data.error("");
                    data.getData(formdata).then(function(coursedata) {
                        data.associates(coursedata.associates);
                        data.courses(coursedata.courses);
                    }, getCoursesError);
                }
            },
            getCoursesLocal: function(files) {
                if (files.length > 0) {
                    data.clearCourses();
                    var f = files[0];
                    if (f.type != "text/plain") {
                        data.error(l.errors.fileTypeError());
                        return
                    }
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        parseTSV(reader.result);
                    };
                    reader.readAsText(f);
                }
            },
            clearCourses: function() {
                data.clearCourses();
                document.getElementById("opform").reset();
            },
            noSubmit: function(e) {
                e.stopPropagation();
                e.preventDefault();
            },
            toggleExcluded: function(idx) {
                i = data.excluded().indexOf(idx);
                if (i >= 0) {
                    data.excluded().splice(i, 1);
                } else {
                    data.excluded().push(idx);
                }
            },
            excludeAll: function(exclude) {
                if (exclude) {
                    data.excluded(data.courses().map(function(c, i) {
                        return i;
                    }));
                } else {
                    data.excluded([]);
                }
            },
            removeFilter: function() {
                filterString("");
            },
            filterKeyUp: function (e) {
                if (e.keyCode == 27) {
                    filterString("");
                } else {
                    filterString(e.target.value);
                }
            },
            nonCompletedCount: function(assigned) {
                var cnt = assigned.length;
                for (var i = 0; i < assigned.length; i++) {
                    if (data.excluded().indexOf(assigned[i]) >= 0) {
                        cnt--;
                    }
                }
                return cnt;
            },
            printTable: function() {
                window.print();
            }
        }
    },

    interfaceView: function(ctrl) {
        var notLoaded = (ctrl.courses().length <= 0);
        var courseOptions = function() {
            if (notLoaded) { return "";}
            return [
                m("div.col-sm-8", [
                    m("h4", [
                        m("div", {className: "btn-group pull-right"}, [
                            m("button", {className: "btn btn-xs btn-primary", onclick: ctrl.excludeAll.papp(false)}, l.main.btnAll()),
                            m("button", {className: "btn btn-xs btn-default", onclick: ctrl.excludeAll.papp(true)}, l.main.btnNone())
                        ]),
                        l.main.step2()
                    ]),
                    m("div.input-group.input-group-sm", [
                        m("input.form-control", {placeholder: l.main.filterList(), value: ctrl.filterString(), onkeyup: ctrl.filterKeyUp}),
                        m("span.input-group-btn",
                             m("button", {className: "btn btn-default btn-danger", onclick: ctrl.removeFilter}, m("span.glyphicon.glyphicon-remove"))
                        )
                    ]),
                    m("div", {className: "btn-group-vertical btn-block scrollable-btn-group"},
                        ctrl.courses().filter(function(course) {
                            return (course.toLowerCase().indexOf(ctrl.filterString().toLowerCase()) > -1);
                        }).map(function (course) {
                            var i = ctrl.courses().indexOf(course);
                            return m("button", {
                                className: "btn btn-xs " + (ctrl.excluded().indexOf(i) >= 0 ? "btn-default" : "btn-primary"),
                                onclick: ctrl.toggleExcluded.papp(i)
                            }, course)
                        })
                    )
                ]),
                m("div.col-sm-2", [
                    m("h4", l.main.step3()),
                    m("br"),
                    m("label", [
                        m("input.control-label", {type: "checkbox", checked: ctrl.printBackground(), onclick: m.withAttr("checked", ctrl.printBackground)}),
                        l.main.printBackground()
                    ]),
                    m("button", {className: "btn btn-default", onclick: ctrl.printTable, style: "margin-top: 10px"}, l.main.printButton())
                ])
            ]
        };
        return m("div", {className: "noprint"}, m("div" + (notLoaded ? ".row" : ""), m("div" + (notLoaded ? ".col-sm-6.col-sm-offset-3.col-md-4.col-md-offset-4" : ""), [
            topBanner(notLoaded),
            m("div.jfdtron.row", [
                languageWidget(),
                m("div" + (notLoaded ? ".col-sm-8.col-sm-offset-2.text-center" : ".col-sm-2"), [
                    m("h4", l.main.step1()),
                    m("form#opform", {onsubmit: ctrl.noSubmit}, [
                        m("div.btn-group-vertical", [
                            m("span", {className: "btn btn-default btn-lg btn-file"}, [
                                m("span#browsecaption", l.main.browseFile()),
                                m("input", {type: "file", onchange: m.withAttr("files", ctrl.getCoursesLocal)})
                            ]),
                            m("button", {className: "btn btn-default", onclick: ctrl.clearCourses}, l.main.clearTable())
                        ])
                    ])
                ]),
                courseOptions()
            ])
        ])));
    },

    tableView: function(ctrl) {
        return [
            m("h2", l.main.tableTitle()),
            m("p", l.main.tableDesc()),
            m("table", {className: "table table-bordered table-condensed"}, [
                m("thead", m("tr", [
                    m("th", l.main.associate()),
                    ctrl.courses().filter(function(course, i) {
                        return (ctrl.excluded().indexOf(i) < 0);
                    }).map(function(course) {
                        return m("th", course);
                    })
                ])),
                m("tbody", Object.keys(ctrl.associates()).map(function(aid) {
                    return m("tr", [
                        m("th.row-header", [
                            m("span", {className: "label label-success"}, ctrl.nonCompletedCount(ctrl.associates()[aid].assigned)),
                            m("span", m.trust("&nbsp;")),
                            m("a[href='/" + aid + "']", {config: m.route}, ctrl.associates()[aid].name[0] + ' ' + ctrl.associates()[aid].name[1][0] + ".")

                        ]),
                        ctrl.courses().filter(function(course, i) {
                            return (ctrl.excluded().indexOf(i) < 0);
                        }).map(function(course) {
                            var i = ctrl.courses().indexOf(course);
                            if (ctrl.associates()[aid].completed.indexOf(i) >= 0) {
                                return m("td", {className: "val completed" + (ctrl.printBackground() ? "F" : ""), key: i});
                            } else if (ctrl.associates()[aid].assigned.indexOf(i) >= 0) {
                                return m("td", {className: "val assigned" + (ctrl.printBackground() ? "F" : ""), key: i});
                            } else {
                                return m("td", {className: "val unassigned" + (ctrl.printBackground() ? "F" : ""), key: i});
                            }
                        })
                    ])
                }))
            ]),
            m("p", l.main.tableLegend())
        ];
    },

    view: function(ctrl) {
        var curView = [this.interfaceView(ctrl)];
        if (ctrl.courses().length > 0) {
            curView.push(this.tableView(ctrl));
        } else if (ctrl.error().length > 0) {
            curView.push(errorAlert(ctrl.error()))
        }
        return curView;
    }
};

var LMSassociate = {
    controller: function(data) {
        var currentAssociate = m.route.param("assoc");

        return {
            currentAssociate: currentAssociate,
            courses: data.courses,
            associates: data.associates,
            excluded: data.excluded,

            returnHome: function() {
                m.route("/")
            },
            printList: function() {
                window.print();
            }
        }
    },

    interfaceView: function(ctrl) {
        return m("div", {className: "noprint"}, [
            topBanner(),
            m("div.jfdtron.row", [
                languageWidget(),
                m("button", {className: "btn btn-default", onclick: ctrl.returnHome}, l.assoc.backButton()),
                m("button", {className: "btn btn-default", onclick: ctrl.printList, style: "margin-left: 10px"}, l.assoc.printButton())
            ])
        ])
    },

    associateView: function(ctrl) {
        var aid = ctrl.currentAssociate;
        if (aid in ctrl.associates()) {
            return [
                m("h1", l.assoc.assocHeader()),
                m("h2", [ctrl.associates()[aid].name[0] + " " + ctrl.associates()[aid].name[1] + " ", m("em", aid)]),
                m("ul", ctrl.courses().filter(function(course, i) {
                    return ((ctrl.associates()[aid].assigned.indexOf(i) >= 0) && (ctrl.excluded().indexOf(i) < 0));
                }).map(function(course) {
                    return m("li", course);
                })),
                m("hr"),
                m("p", l.assoc.assocMessage())
            ]
        } else {
            return errorAlert(l.errors.assocNotFound());
        }
    },

    view: function(ctrl) {
        var curView = [this.interfaceView(ctrl)];
        if (ctrl.courses().length > 0) {
            curView.push(this.associateView(ctrl));
        } else {
            curView.push(errorAlert(l.errors.assocNoData()));
        }
        return curView
    }
};

var LMShelp = {
    controller: function() {
        return {
            returnHome: function () {
                m.route("/")
            }
        }
    },

    view: function(ctrl) {
        return m("div.as-table", [
            m("div", {className: "noprint"}, [
                topBanner(),
                m("div.jfdtron.row", [
                    languageWidget(),
                    m("button", {className: "btn btn-default", onclick: ctrl.returnHome}, l.assoc.backButton())
                ])
            ]),
            m("div.as-table-row",
                m("iframe", {src: "help/" + l.currentLanguage() + "/index.html"})
            )
        ])
    }
};