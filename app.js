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

var urlE = 'https://www.olx.com.pk/electronics-home-appliances/?page=';
spider.url('https://www.olx.com.pk/electronics-home-appliances/');
spider.scraper(function($,done){
    var data = $('table.fixed').scrape({
        cat : function() {
            return $(this).find('small.breadcrumb.small').text().trim().replace(/[.*+?^${}()|[\]\\\n]/g,' ').split('»')[1].trim().replace(/\w+[.!?]?$/, '');
          },
        cat2 : function() {            
            return $(this).find('small.breadcrumb.small').text().trim().split(/\r?\n/)[0];
          },
        links : {sel : 'a.marginright5.link.linkWithHash.detailsLink',attr: 'href'},
        image: {sel: 'tr td div span a img', attr : 'src'}
    });
    
    done(null,data);
});
spider.limit(5);
spider.result(function(err,req,res){
    if(!err){
        var arr = res.data;
        arr.splice(0, 1);
        //console.log(arr);
        arr.forEach(function(data1){ 
            console.log(data1.cat2);
            var catss = data1.cat2.split("»");
            var cats1 = cats.get(catss[0].trim());
            var cats2 = cats.get(catss[1].trim());
            if(cats2 && (cats2>cats1)){
                console.log("case 2");
                console.log(catss[1].trim());
                console.log(cats.get(catss[1].trim()));
            }else{
                console.log("case 1");
                console.log(catss[0].trim());
                console.log(cats.get(catss[0].trim()));
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
    connection.query('INSERT INTO table_jobs SET ?', href_post, function (error, results) {
        if(!error){

        console.log(results.insertId);
     }
    });
}

spider.run(function(err,remains){
    console.log('Finished!');
});

