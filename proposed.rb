# /math.undefied
inline fn +any any any -- int in
    fake(drop)
    fake(drop)
    fake(int)
    fake(int)
    +
end

# /main.undefied
include "values"
include "./math"

type u64 byte 8 end

fn cast(u64) any -- u64 in
    cast u64 int end
end

trait add
    fn + T T -- T end
end

trait sub
    fn - T T -- T end
end

trait mul
    fn * T T -- T end
end

trait divmod
    fn /% T T -- T T end
end

trait div
    fn / T T -- T end
end

trait mod
    fn mod T T -- T end
end

trait serializable
    fn serialize T File end
    fn unserialize T File end
end

type-hastrait serializable serializable end

type-hastrait divisible mod div divmod end

type-hastrait hasNew new end
type-hastrait hasMath sub add mul mod div divmod end

impl u64 add new in
    inline fn + u64 u64 -- u64 in
        +any cast(u64)
    end

    inline fn new int -- u64 in
        cast(u64)
    end

    inline fn int BigInt -- int in cast(int) end
end

fn main in
    10 u64::new
    11 u64::new
    ::+ ::int
    print
end