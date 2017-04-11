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

cats.set("Bikes",9);
cats.set("Motorcycles",39);
cats.set("Spare Parts",40);
cats.set("Bicycles",41);
cats.set("Scooters",42);
cats.set("ATV & Quads",43);



connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});





var urlE = 'https://www.olx.com.pk/bikes/?page=';
spider.url('https://www.olx.com.pk/bikes/');
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
    connection.query('INSERT INTO table_bikes SET ?', href_post, function (error, results) {
        if(!error){

        console.log(results.insertId);
     }
    });
}

spider.run(function(err,remains){
    console.log('Finished!');
});

