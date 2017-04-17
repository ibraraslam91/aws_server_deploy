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

cats.set("Kids",14);
cats.set("Kids Furniture",75);
cats.set("Toys",76);
cats.set("Prams & Walkers",77);
cats.set("Swings & Slides",78);
cats.set("Kids Bikes",79);
cats.set("Kids Accessories",80);



connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});





var urlE = 'https://www.olx.com.pk/kids-baby-products/?page=';
spider.url('https://www.olx.com.pk/kids-baby-products/');
spider.scraper(function($,done){
    var data = $('table.fixed').scrape({
        cat : function() {
            return $(this).find('small.breadcrumb.small').text().trim().split(/\r?\n/)[0];
          },
        links : {sel : 'a.marginright5.link.linkWithHash.detailsLink',attr: 'href'},
        image: {sel: 'tr td div span a img', attr : 'src'}
    });
    
    done(null,data);
});
spider.limit(100);
spider.result(function(err,req,res){
    if(!err){
        var arr = res.data;
        arr.splice(0, 1);
    //    console.log(arr);
        arr.forEach(function(data1){ 
          var catss = data1.cat.split("»");
          var cats1 = cats.get(catss[0].trim());
          var cats2 = cats.get(catss[1].trim());
            if(cats2 && (cats2>cats1)){
                mysqlPostData(data1.links,data1.image,cats2);                  
            }else{
                mysqlPostData(data1.links,data1.image,cats1);  
            }  
        })
        count++;
        this.addUrls(urlE+count);
    }else{
        console.log(err);
    }
});

function mysqlPostData(href,imgUrl,cat){    
    var href_post = {'hrefs':href,'imageUrl':imgUrl,'subCh':cat};
    connection.query('INSERT INTO table_kids SET ?', href_post, function (error, results) {
        if(!error){

        console.log(results.insertId);
     }
    });
}

spider.run(function(err,remains){
    console.log('Finished!');
});

