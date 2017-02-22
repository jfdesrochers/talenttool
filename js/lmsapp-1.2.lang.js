///////////////////////////////////////////////////////////////////////////////////////
// Helper functions
///////////////////
//
setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};
//
///////////////////////////////////////////////////////////////////////////////////////

var Language = function() {
    var curLang = document.cookie.replace(/(?:(?:^|.*;\s*)currentlang\s*\=\s*([^;]*).*$)|^.*$/, "$1") || navigator.language || navigator.userLanguage || "fr";
    curLang = curLang.substr(0, 2);

    var t = function(frText, enText) {
        return function () {
            return (curLang == "fr" ? frText : enText);
        }
    };

    var getsetCurLang = function(lang) {
        if ((arguments.length) && (lang != curLang)) {
            m.startComputation();
            curLang = lang;
            setCookie("currentlang", lang, 60);
            m.endComputation();
        }
        return curLang;
    };

    return {
        currentLanguage: getsetCurLang,
        main: {
            talentTitle: t("Talent Tool par Jean-François Desrochers", "Talent Tool by Jean-François Desrochers"),
            talentDesc: t("Cet outil vous permettra de produire des rapports personnalisés et visuellement plaisants à partir des données de Talent Track. ", "This tool will allow you to produce fully customized and visually stunning reports using data from Talent Track. "),
            talentLinkTitle: t("Apprenez comment l'utiliser.", "Learn how to use it."),
            step1: t("Commencez ici", "Start here"),
            browseFile: t("Choisir le fichier...", "Browse for file..."),
            clearTable: t("Effacer le tableau", "Clear table"),
            step2: t("Choisissez les cours à afficher dans votre tableau", "Choose the courses to be displayed in the table"),
            btnAll: t("Tous", "All"),
            btnNone: t("Aucun", "None"),
            filterList: t("Filtrer la liste...", "Filter list..."),
            printBackground: t(" Imprimer les couleurs d'arrière-plan", " Print background colors"),
            associate: t("Associé", "Associate"),
            tableTitle: t("Rapport sur la formation Talent Track LMS", "Talent Track LMS training report"),
            tableDesc: t("Voici le statut de la formation auprès de vos associés pour les cours sélectionnés.", "Below is the training completion status by your associates for the selected courses."),
            tableLegend: t("Légende: \u2714 = Cours complété  \u2718 = Cours assigné à cet associé mais non complété  \u26D4 = Cours non-assigné ou ne concerne pas cet associé.", "Legend: \u2714 = Course is completed  \u2718 = Course is assigned to this associate but is not completed  \u26D4 = Course is not assigned or does not concern this associate."),
            step3: t("Imprimez vos données", "Print your data"),
            printButton: t("Imprimer le tableau", "Print table")
        },
        assoc: {
            assocHeader: t("Vos formations à compléter", "Training to be completed"),
            assocMessage: t("Pour compléter vos cours, rendez-vous sur la page http://bit.ly/talenttrack. Utilisez le même nom d'utilisateur et mot de passe que vous utilisez pour l'horodateur. Entrez ensuite le nom du cours à faire dans le champ de recherche.",
                            "To complete your courses, please log on to http://bit.ly/talenttrack. You can use the same username and password that you use to access your schedule. Then, enter the course name in the search field."),
            backButton: t("< Retour", "< Go back"),
            printButton: t("Imprimer la liste", "Print list")
        },
        errors: {
            errorLabel: t("Erreur: ", "Error: "),
            serverError: t("Une erreur de serveur s'est produite. Vérifiez que vous avez soumis le bon fichier.", "A server error has occured. Please verify that you have submitted the correct file."),
            assocNotFound: t("Le numéro d'associé spécifié n'a pas été trouvé. Vérifiez qu'il fait bel et bien partie du fichier que vous avez chargé et réessayez.", "The specified associate number cannot be found. Please verify that it is listed in the loaded file and try again."),
            assocNoData: t("Aucune donnée n'a été chargée! Vous devez charger un fichier de données avant d'accéder aux cours d'un associé.", "No data has been loaded yet! You must load a data file before you try to access an associate's courses."),
            fileTypeError: t("Le format du fichier chargé n'est pas valide. Assurez-vous que vous prenez l'option 'texte' lorsque vous exportez vos données dans Talent Track.", "The format of the loaded file is invalid. Please make sure that you select 'text' when you export your data using Talent Track."),
            fileParseError: t("Une erreur s'est produite lors du chargement du fichier. Assurez-vous que vous avez chargé le bon fichier.", "An error occured while trying to process the loaded file. Please make sure that you have loaded the right file.")
        }

    }
};

l = new Language();