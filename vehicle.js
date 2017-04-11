var mysql      = require('mysql');
var sandcrawler = require('sandcrawler');
var HashMap = require('hashmap');
var spider = sandcrawler.spider();
var count=1;


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'qweasdzx',
  database : 'wp2',
  socketPath:'/opt/lampp/var/mysql/mysql.sock'
});


var cats = new HashMap();
cats.set("Vehicles",7);
cats.set("Cars",28);
cats.set("Spare Parts",29);
cats.set("Boats",30);
cats.set("Trailers",31);
cats.set("Other Vehicles",32);
cats.set("Buses, Vans & Trucks",121);
cats.set("Tractors",122);




connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});





var urlE = 'https://www.olx.com.pk/vehicles/?page=';
spider.url('https://www.olx.com.pk/vehicles/');
spider.scraper(function($,done){
    var data = $('table.fixed').scrape({
        cat : function() {
            return $(this).find('small.breadcrumb.small').text().trim().replace(/[.*+?^${}()|[\]\\\n]/g,' ').split('»')[0].trim();
          },
        links : {sel : 'a.marginright5.link.linkWithHash.detailsLink',attr: 'href'},
        image: {sel: 'tr td div span a img', attr : 'src'}
    });
    
    done(null,data);
});
spider.limit(1);
spider.result(function(err,req,res){
    if(!err){
        var arr = res.data;
        arr.splice(0, 1);
        console.log(arr);
        arr.forEach(function(data1){ 
          console.log(data1.links);
          mysqlPostData(data1.links,data1.image,data1.cat);  
        })
        count++;
        this.addUrls(urlE+count);
    }else{
        console.log(err);
    }
});

function mysqlPostData(href,imgUrl,cat){
    var sub = cats.get(cat);
    var href_post = {'hrefs':href,'imageUrl':imgUrl,'subCh':sub};
    connection.query('INSERT INTO table_vehicles SET ?', href_post, function (error, results) {
        if(!error){

        console.log(results.insertId);
     }
    });
}

spider.run(function(err,remains){
    console.log('Finished!');
});

