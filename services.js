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

cats.set("Services",15);
cats.set("Education & Classes",81);
cats.set("Web Development",82);
cats.set("Electronics & Computer Repair",83);
cats.set("Maids & Domestic Help",84);
cats.set("Health & Beauty",85);
cats.set("Travel & Visa",86);
cats.set("Movers & Packers",87);
cats.set("Drivers & Taxi",88);
cats.set("Event Services",89);
cats.set("Other Services",90);





connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});





var urlE = 'https://www.olx.com.pk/services/?page=';
spider.url('https://www.olx.com.pk/services/');
spider.scraper(function($,done){
    var data = $('table.fixed').scrape({
        cat : function() {
            return $(this).find('small.breadcrumb.small').text().trim().split(/\r?\n/)[0];
          },
        links : {sel : 'a.marginright5.link.linkWithHash.detailsLink',attr: 'href'}        
    });
    
    done(null,data);
});
spider.limit(500);
spider.result(function(err,req,res){
    if(!err){
        var arr = res.data;
       // arr.splice(0, 1);
        console.log(arr);
        arr.forEach(function(data1){ 
          var catss = data1.cat.split("»");
          var cats1 = cats.get(catss[0].trim());
          var cats2 = cats.get(catss[1].trim());
            if(cats2 && (cats2>cats1)){
                mysqlPostData(data1.links,cats2);                  
            }else{
                mysqlPostData(data1.links,cats1);  
            }  
        })
        count++;
        this.addUrls(urlE+count);
    }else{
        console.log(err);
    }
});

function mysqlPostData(href,cat){

    var href_post = {'hrefs':href,'subCh':cat};
    connection.query('INSERT INTO table_services SET ?', href_post, function (error, results) {
        if(!error){

        console.log(results.insertId);
     }
    });
}

spider.run(function(err,remains){
    console.log('Finished!');
});

