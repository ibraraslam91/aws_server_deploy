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
cats.set("Animals",11);
cats.set("Fish & Aquariums",53);
cats.set("Birds",54);
cats.set("Hens & Asee",55);
cats.set("Cats",56);
cats.set("Dogs",57);
cats.set("Livestock",58);
cats.set("Pet Food & Accessories",60);
cats.set("Other Pets",61);

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

var urlE = 'https://www.olx.com.pk/animals/?page=';
spider.url('https://www.olx.com.pk/animals/');
spider.scraper(function($,done){
   
    var data = $('ul.gallerywide li').scrape({       
        cat : function() {
            return $(this).find('span.breadcrumb.small').text().trim().split(/\r?\n/)[0];
          },
         links : {sel : 'a.link.linkWithHash.detailsLink',attr: 'href'},
        image: function() {
            return $(this).find('div > a > img').attr('src');
          },
    });
    
    done(null,data);
});
spider.limit(1);
spider.result(function(err,req,res){
    if(!err){
        var arr = res.data;                
        arr.splice(0, 1);
           
        arr.forEach(function(data1){ 
          var catss = data1.cat.split("»");
          var cats1 = cats.get(catss[0].trim());
          var cats2 = cats.get(catss[1].trim());
            if(cats2 && (cats2>cats1)){
                console.log("case 2");
                mysqlPostData(data1.links,data1.image,cats2);                  
            }else{
                console.log("case 2");
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
    connection.query('INSERT INTO table_animals SET ?', href_post, function (error, results) {
        if(!error){

        console.log(results.insertId);
     }
    });
}

spider.run(function(err,remains){
    console.log('Finished!');
});