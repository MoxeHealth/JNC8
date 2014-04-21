JNC8 Overview
==========

This app is the result of contract work by Hack Reactor students
Shane Keller and Ian Lyons. It's a high blood pressure (hypertension) treatment calculator and visualizer based on JNC8 guidelines.

It's deployed on Moxe's dashboard as well as a standalone website, and is meant to be an interactive educational experience that a doctor leads their patient through during a patient encounter, or visit.

Workflow
==========

Given a patient's race, age, blood pressure, problems list (if they have diabetes and/or CKD), current medication doses and class names, the app will use the JNC8 treatment algorithm to determine the patient's recommended target blood pressure, and which classes of hypertension medication, if any, the patient should be prescribed. 

Visitors to the standalone website will be prompted to enter the necessary information before the algorithm is run. The first time a user visits the website, the user will be prompted to enter their email. Entering an email and saving to the database at the end of the session generates a url containing a hash of the entered email, which is emailed to the user. For future visits, the user accesses the website via the url. The hash on the url is used to retrieve the user's information from the MSSQL database at the beginning of each subsequent encounter. 

Users of the app within the Moxe dashboard will be taken directly to the recommendation visualization page, as the necessary patient information is automatically pulled from Moxe's Substrate API. Therefore, for the app to work properly for a Moxe patient, the Substrate database must already contain the necessary information to calculate treatment recommendations. 

A chart displaying the patient's blood pressure and target blood pressure is displayed, along with a list of recommended medications and the current lowest price of each medication, pulled from the GoodRx API. 

All users can adjust the target blood pressure, which affects both the visualization and the value of the target blood pressure for that encounter, which is then saved to the database. 

At the end of an encounter, the user can save the data to an MSSQL database. The Moxe database should be the single source of truth for as much information as possible. It would be confusing if doctors could write information that already existed in the patient's EMR (accessed through Substrate) to the MSSQL database, so Moxe users can only save the target blood presure recorded and the encounter date. Standalone users do not have any information in an EMR accessed through Substrate, so in contrast to the workflow for Moxe users, all patient information recorded in the data entry view is saved to the database. 

Stack:
==========
- AngularJS: 1.2.x (IE 8 support dropped in later versions)
- D3
- R2D3 for IE8 compatibility: https://github.com/mhemesath/r2d3/
- Node JS
- Express
- Microsoft SQL - MSSQL  
- Deployed on Azure 

Future Features:
==========
See GitHub issues of repo. 

Challenges:
==========
Developing algorithm based on JNC8 guidelines. It was tough to translate all of the possible scenarios and their corresponding recommendations into code. For example, at first we tried hard coding the various combinations of recommended drugs into a data structure. That proved to not be scalable, so we wrote a helper function for the algorithm function that used breadcrumbing to select the recommended drug classes based on the classes of the currently prescribed medications. 

Deploying to MSSQL. MSSQL's documentation did not cover a lot of the errors that would be encountered when setting up an MSSQL database and querying it via an Express server. 

Front-end development in IE8. 
- In order to ensure that our D3 visualizations were compatible, we used a build of D3 called R2D3. The downside of R2D3 is that it has more limited features than D3. We also weren't able to use powerful D3 libraries like C3. So it takes a bit longer to do visualizations in IE8 than it would in other browsers. 

- IE8 doesn't include console.log or .indexOf, and requires some special configuration of AngularJS to ensure compatibility.



