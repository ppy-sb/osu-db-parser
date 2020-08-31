/* Reader base from osu-packet! */
const OsuBuffer = require('osu-buffer');

class Reader {
    constructor() {
    }
  
    /**
     * Reads a set of data from a buffer
     * @param {OsuBuffer} buff
     * @param {Object} layout
     * @param {null|Number|Boolean|Object|Array|String} requires
     * @param {Object|Array} data
     * @return {Object|Array}
     */
    async Read(buff, layout, data = {}) {
      switch (layout.type.toLowerCase()) {
        case 'int8':
          data = await buff.ReadInt8();
          break;
        case 'uint8':
          data = await buff.ReadUInt8();
          break;
        case 'int16':
          data = await buff.ReadInt16();
          break;
        case 'uint16':
          data = await buff.ReadUInt16();
          break;
        case 'int32':
          data = await buff.ReadInt32();
          break;
        case 'uint32':
          data = await buff.ReadUInt32();
          break;
        case 'int64':
          data = await buff.ReadInt64();
          break;
        case 'uint64':
          data = await buff.ReadUInt64();
          break;
        case 'string':
          data = await buff.ReadOsuString();
          break;
        case 'float':
          data = await buff.ReadFloat();
          break;
        case 'double':
          data = await buff.ReadDouble();
          break;
        case 'boolean':
          data = await buff.ReadBoolean();
          break;
        case 'byte':
          data = await buff.ReadByte();
          break;
        case 'int32array': {
          let len = await buff.ReadInt16();
          data = [];
          for (let i = 0; i < len; i++) {
            data.push(await buff.ReadInt32());
          }
          break;
        }
        case "collections": {
          let collectionsCount = data['collectionscount'];
          data = [];
          for (let i=0; i < collectionsCount; i++) {
            let collection = {
              'name': await buff.ReadOsuString(),
              'beatmapsCount': await buff.ReadInt32(),
              'beatmapsMd5': []
            }

            for (let i=0; i<collection['beatmapsCount']; i++) {
              let bmmd5 = await buff.ReadOsuString();
              collection['beatmapsMd5'].push(bmmd5)
            }

            data.push(collection);
          }
          break;
        }
        case "beatmaps": {
            let osuver = data['osuver'];
            let beatmapscount = data['beatmaps_count'];
            data = [];
            for (let i = 0; i < beatmapscount; i++) {
                if (osuver < 20191107) {
                  await buff.ReadInt32(); // entry size xd
                }
                let beatmap = {
                  'artist_name': await buff.ReadOsuString(),
                  'artist_name_unicode': await buff.ReadOsuString(),
                  'song_title': await buff.ReadOsuString(),
                  'song_title_unicode': await buff.ReadOsuString(),
                  'creator_name': await buff.ReadOsuString(),
                  'difficulty': await buff.ReadOsuString(),
                  'audio_file_name': await buff.ReadOsuString(),
                  'md5': await buff.ReadOsuString(),
                  'osu_file_name': await buff.ReadOsuString(),
                  'ranked_status': await buff.ReadByte(),
                  'n_hitcircles': await buff.ReadInt16(),
                  'n_sliders': await buff.ReadInt16(),
                  'n_spinners': await buff.ReadInt16(),
                  'last_modification_time': await buff.ReadInt64()
                }

                if (osuver < 20140609) {
                  beatmap = {
                    ...beatmap,
                    'approach_rate': await buff.ReadByte(),
                    'circle_size': await buff.ReadByte(),
                    'hp_drain': await buff.ReadByte(),
                    'overall_difficulty': await buff.ReadByte()
                  }
                } else {
                  beatmap = {
                    ...beatmap,
                    'approach_rate': await buff.ReadFloat(),
                    'circle_size': await buff.ReadFloat(),
                    'hp_drain': await buff.ReadFloat(),
                    'overall_difficulty': await buff.ReadFloat()
                  }
                }

                beatmap['slider_velocity'] = await buff.ReadDouble()
                
                if (osuver >= 20140609) {
                  let difficulties = []
                  
                  for(let i = 0; i<4; i++) {
                    let length = await buff.ReadInt32()
                    let diffs = {}
                    for(let i=0; i<length; i++) {
                        await buff.ReadByte()
                        let mode = await buff.ReadInt32();
                        buff.ReadByte();
                        let diff = await buff.ReadDouble();
                        diffs[mode] = diff
                    }
                    difficulties.push(diffs)
                  } 

                  beatmap = {
                    ...beatmap,
                    'star_rating_standard': difficulties[0],
                    'star_rating_taiko': difficulties[1],
                    'star_rating_ctb': difficulties[2],
                    'star_rating_mania': difficulties[3],
                  }
                }         
                
                beatmap = {
                  ...beatmap,
                  'drain_time': await buff.ReadInt32(),
                  'total_time': await buff.ReadInt32(),
                  'preview_offset': await buff.ReadInt32(),
                }

                let timingPoints = [];
                let timingPointsLength = await buff.ReadInt32()
                for (let i = 0; i < timingPointsLength; i++) {
                  timingPoints.push([
                    await buff.ReadDouble(), //BPM
                    await buff.ReadDouble(), // offset
                    await buff.ReadBoolean() // Boolean
                  ])
                }

                beatmap = {
                  ...beatmap,
                  'beatmap_id': await buff.ReadInt32(),
                  'beatmapset_id': await buff.ReadInt32(),
                  'thread_id': await buff.ReadInt32(),
                  'grade_standard': await buff.ReadByte(),
                  'grade_taiko': await buff.ReadByte(),
                  'grade_ctb': await buff.ReadByte(),
                  'grade_mania': await buff.ReadByte(),
                  'local_beatmap_offset': await buff.ReadInt16(),
                  'stack_leniency': await buff.ReadFloat(),
                  'mode': await buff.ReadByte(),
                  'song_source': await buff.ReadOsuString(),
                  'song_tags': await buff.ReadOsuString(),
                  'online_offset': await buff.ReadInt16(),
                  'title_font': await buff.ReadOsuString(),
                  'unplayed': await buff.ReadBoolean(),
                  'last_played': await buff.ReadInt64(),
                  'osz2': await buff.ReadBoolean(),
                  'folder_name': await buff.ReadOsuString(),
                  'last_checked_against_repository': await buff.ReadInt64(),
                  'ignore_sound': await buff.ReadBoolean(),
                  'ignore_skin': await buff.ReadBoolean(),
                  'disable_storyboard': await buff.ReadBoolean(),
                  'disable_video': await buff.ReadBoolean(),
                  'visual_override': await buff.ReadBoolean()
                }

                if (osuver < 20140609) {
                  await buff.ReadInt16()
                }
                beatmap['last_modification_time_2'] = await buff.ReadInt32();

                beatmap['mania_scroll_speed'] = await buff.ReadByte()

                data.push(beatmap);
            }
        }
      }
      return data;
    }
  
    /**
     * Unmarshal's the buffer from the layout
     * @param {OsuBuffer|Buffer} raw
     * @param {Array|Object|Null} layout
     * @return {Object|Null}
     */
    UnmarshalPacket(raw, layout = null) {
      if (!raw) {
        return null;
      }
      let buff = raw;
      if (raw instanceof Buffer) {
        buff = OsuBuffer.from(raw);
      }
      if (layout instanceof Array) {
        return layout.reduce(async (data, item) => {
          data = await data
          if(item.uses) {
            let needelements = item.uses.split(",")
            let dater = {}
            for (let datak of needelements) {
              dater[datak] = data[datak]
            }
            data[item.name] = await this.Read(buff, item, item.uses ? dater : null);
          } else {
            data[item.name] = await this.Read(buff, item);
          }
          return data
        },{});
      } else if (layout instanceof Object) {
        return this.Read(buff, layout);
      }
    }

  }
  
  module.exports = Reader;