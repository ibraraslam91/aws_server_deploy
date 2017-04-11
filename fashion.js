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

cats.set("Fashion & Beauty",13);
cats.set("Watches",67);
cats.set("Wedding",68);
cats.set("Clothes",69);
cats.set("Accessories",70);
cats.set("Footwear",71);
cats.set("Skin & Hair",72);
cats.set("Make Up",73);
cats.set("Jewellery",74);


connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});





var urlE = 'https://www.olx.com.pk/fashion-beauty/?page=';
spider.url('https://www.olx.com.pk/fashion-beauty/');
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
    connection.query('INSERT INTO table_fashion_beauty SET ?', href_post, function (error, results) {
        if(!error){

        console.log(results.insertId);
     }
    });
}

spider.run(function(err,remains){
    console.log('Finished!');
});

