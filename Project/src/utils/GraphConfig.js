//Imports Here

//Functions Here
//GraphTypes: 0 = BarGraph, 1 = LineGraph, 2 = PieGraph, 3 = TestCase, Any other val is null.
function buildAxis(graphType){
    let scaleStr = "";
    let dataArr = [];

    switch (graphType) {
        case 0:
            //Make BarGraph axis data
            break;
        case 1:
            //Make LineGraph axis data
            break;

        case 2:
            //Make PieGraph axis data
            break;
        case 3:
            //Make TestCase axis data for other Charts.
            //If other axis data for other graphs is needed,
            //A new case can be made accordingly.
            break;
        default:

            break;
    }
}

function buildSeries(graphType){
    let idCount = 0;
    let valueArr = [];
    let labelArr = [];
    let dataArr = [];

    switch (graphType) {
        case 0:
            //Make BarGraph series data
            break;
        case 1:
            //Make LineGraph series data
            break;

        case 2:
            //Make PieGraph series data
            break;
        case 3:
            //Make TestCase series data for other Charts.
            //If other series data for other graphs is needed,
            //A new case can be made accordingly.
            break;
        default:

            break;
    }
}