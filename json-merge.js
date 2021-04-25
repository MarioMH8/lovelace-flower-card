const glob = require("glob");
const fs = require("fs");

const db = [];

glob("json/*.json", function(err, files) { // read the folder or folders if you want: example json/**/*.json
    if(err) {
        console.error("cannot read the folder, something goes wrong with glob", err);
    }
    files.forEach(function(file) {
        const data = fs.readFileSync(file).toString('utf8');
        if (data == null || data === '' || data === 'null') {
            return;
        }
        try {
            const obj = JSON.parse(data);
            const key = obj.pid.rep
            const info = [];
            info.push(obj.pid)
            info.push(obj.display_pid)
            info.push(obj.parameter.min_temp)
            info.push(obj.parameter.max_temp)
            info.push(obj.parameter.min_light_lux)
            info.push(obj.parameter.max_light_lux)
            info.push(obj.parameter.min_soil_moist)
            info.push(obj.parameter.max_soil_moist)
            info.push(obj.parameter.min_soil_ec)
            info.push(obj.parameter.max_soil_ec)
            db.push(info);
        } catch (e) {
            console.error('File: ', file);
            console.error('Error: ', e);
            console.error('Content: ', data);
            throw e;
        }
    });

    let data = JSON.stringify({db});
    fs.writeFileSync('src/flower-card.json', data);
});
