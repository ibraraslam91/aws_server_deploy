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

cats.set("Computers & Accessories",21);
cats.set("TV - Video - Audio",22);
cats.set("Cameras & Accessories",23);
cats.set("Games & Entertainment",24);
cats.set("Other Home Appliances",25);
cats.set("Generators,UPS & Power Solutions",26);
cats.set("Fridge - AC - Washing Machine",27);
cats.set("Kitchen Appliances",20);
cats.set("Electronics & Home Appliances",6);


connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});





var urlE = 'https://www.olx.com.pk/electronics-home-appliances/?page=';
spider.url('https://www.olx.com.pk/electronics-home-appliances/');
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
    connection.query('INSERT INTO table_electronics_home_appliances SET ?', href_post, function (error, results) {
        if(!error){

        console.log(results.insertId);
     }
    });
}

spider.run(function(err,remains){
    console.log('Finished!');
});

