const articlesApi = (function() {

  let articles = [

    {
      header: `Comparison of Naive and KMP algorithms in search of all occurences of a pattern in a text`,
      date: "2016-12-24",
      id: 2,
      description: `A naive algorithm has $O(nm)$ compexity where <i>n</i> and <i>m</i> are lengths of a text and a pattern. While
    <a href=" https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm " target="_blank">KMP</a> has complexity $\\theta(n+m)$. But what is the difference in practice on different string sequences?`,
      content: `<h6>Comparison of Naive and KMP algorithms in search of all occurences of a pattern in a text.</h6>
    <time class="post-time">2016-12-24</time>

    <div class="content">
      In this post I will try to benchmark two algorithms for searching of all pattern occurences in a text.
      <br/> For benchmark <a href="https://scalameter.github.io/" target="_blank">ScalaMeter</a> and its inline benchmarking feature will be used.
      <br/>
      <br/> This is an interface for two string matchers: naive and <a href="https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm" target="_blank">KMP</a>:
      <br/>
      <br/>
      <div j-scala-decorator>
        <code>
          <pre>
trait StringMatcher {
    /*
    Returns a sequence of start indexes of all occurences of a pattern
    */
    def matched : Seq[Int]
}
          </pre>
        </code>
      </div>
      <br/>
      <br/> And this is MatcherBenchmark object to test matcher performance:
      <br/>
      <br/>
      <div j-scala-decorator>
        <code>
          <pre>
import org.scalameter._

object MatcherBenchmark {

    def run(matcher : StringMatcher) : Quantity[Double] = {
        config(Key.exec.benchRuns -> 30) withWarmer {
          new Warmer.Default
        } withMeasurer {
          new Measurer.IgnoringGC
        } measure {
          matcher matched
        }
    }
 }
        </pre>
      </code>
      </div>
      <br/> Naive implementation is self-explanatory:
      <br/>
      <br/>
      <div j-scala-decorator>
        <code>
          <pre>
import scala.collection.mutable.ListBuffer


case class BruteForceStringMatcher(text: String, pattern : String) extends StringMatcher {
  private val patternLen = pattern length
  private val textLen = text length

  def matched : Seq[Int] = {
    val result = ListBuffer[Int]()
    for (index <- 0 to textLen - patternLen if isMatch(index))
      result += index
  }


  def isMatch(index : Int) : Boolean = {
    var i = index
    var j = 0
    while (i < textLen && j < patternLen && text(i) == pattern(j)) {
      i += 1
      j += 1
    }

    j == patternLen
  }
}
        </pre>
      </code>
      </div>
      <br/> KMPStringMatcher will be hard to understand without pre-study of KMP algorithm and a notion of string border (<a href="https://en.wikipedia.org/wiki/Substring" target='_blank'>Substring</a>)
      <br/>
      <br/>
      <div j-scala-decorator>
        <code class="spoiler-body">
          <pre>
case class KMPStringMatcher(val text: String, val pattern : String) extends StringMatcher {
  val borders = new Array[Int](pattern.length)
  val textLen = text length
  val patternLen = pattern length

  /*
  Calculate all borders of all pattern prefixes
  */
  if (patternLen > 0)
    borders(0) = 0

  for (i <- 1 until patternLen) {
    var b = borders(i-1)
    while (b > 0 && pattern(i) != pattern(b))
      b = borders(b - 1)
    borders(i) = if (pattern(i) == pattern(b)) b + 1 else 0
  }

  def matched : Seq[Int] = {
    val result = ListBuffer[Int]()
    var i = 0
    var j = 0
    while (i < textLen - patternLen + 1) {
      val m = isMatch(i, j)
      i = m._1
      j = m._2
      if (j == patternLen)
        result += i - patternLen
      if (j == 0)
        i += 1
      else
        j = borders(j - 1)
    }

    result
  }
  /*
  Compares pattern and test starting from the specified positions and returns the first mismatch of letters in both pattern and text
  */
  private def isMatch(patternIndex : Int, textIndex : Int) : (Int, Int) = {
    var i = patternIndex
    var j = textIndex
    while (i < textLen && j < patternLen && text(i) == pattern(j)) {
      i += 1
      j += 1
    }
    (i, j)
  }

}
          </pre>
  </code>
      </div>
      <br/> So now everything is ready to make performance comparison.
      <br/> Let's compare very special and homogeneous input and quite random input performance:
      <br/>
      <br/>
      <div j-scala-decorator>
        <code>
          <pre>
 object Program {
   def main(args: Array[String]) {
     var text = "aaaaaa"*10000
     var pattern = "aaaaaa"*100 + "b"
     var bfTime = MatcherBenchmark.run(BruteForceStringMatcher(text, pattern))
     println(s"Total time of brute force: $bfTime")
     var kmpTime = MatcherBenchmark.run(KMPStringMatcher(text, pattern))
     println(s"Total time of KMP: $kmpTime")
     println("-----------------------")
     val rand = new scala.util.Random()
     text = rand.alphanumeric.take(6*10000).mkString
     pattern = rand.alphanumeric.take(6*100).mkString + "b"
     bfTime = MatcherBenchmark.run(BruteForceStringMatcher(text, pattern))
     println(s"Total time of brute force: $bfTime")
     kmpTime = MatcherBenchmark.run(KMPStringMatcher(text, pattern))
     println(s"Total time of KMP: $kmpTime")
  }
}
        </pre>
  </code>
        <code>
          <br />
          <br />
    <div style="color:black">
      <pre>
And program output:

Running time of brute force: 56.31063416666666 ms
Running time of KMP: 1.7398440333333336 ms
-----------------------
Running time of brute force: 1.7647567666666668 ms
Running time of KMP: 0.8171639000000002
      </pre>
    </div>
  </code>
      </div>
      <br/> We can see that in here KMP is ~32 times faster than brute force implementation on homogeneous input data.<br/> And only ~2 times faster on random input.<br/><br/> Indeed, KMP is very good on homogeneous, repetitive and strong-periodic texts,
      finding next matching of a pattern $p = a^m$ in a text $t = a^n$ in a constant time, but on random strings its running time approaching brute force implementation.
      <br/>
      <br/>
    </div>`
    },
    {
      header: `Solving an exercise 5.1-2 from 'Introduction to Algorithms' by Cormen, Leiserson, Rivest and Clifford Stein`,
      date: "2016-12-11",
      id: 1,
      description: `This exercise asks to describe an implementation of $RANDOM(a, b)$ procedure that only makes calls to RANDOM(0, 1). A definition of $RANDOM(a, b)$ in the book is that the procedure returns an integer between a and b, inclusive, where each integer being
    equally likely.`,
      content: `<h6>Solving an exercise 5.1-2 from 'Introduction to Algorithms' by Cormen, Leiserson, Rivest and Clifford Stein.</h6>
    <time class="post-time">2016-12-11</time>

    <div class="content">
      <p>
    This exercise asks to describe an implementation of $RANDOM(a, b)$ procedure that only makes calls to $RANDOM(0, 1)$. A definition of $RANDOM(a, b)$ in the
    book is that the procedure returns an integer between a and b, inclusive, where each integer being equally likely.</p>

      <p style="font-style:italic">
        "Describe an implementation of the procedure RANDOM(a, b) that only makes calls to RANDOM(0, 1). What is the expected running time of your procedure, as a function of a and b?"
      </p>

      <p>
       This is how it can be done:
      </p>
      <br/>
      <p>
        First we need an implementation of $RANDOM(0, 1)$:
      </p>
      <br/>
      <br/>

      <div j-scala-decorator>
        <code>
          <pre>
object BoolUniformGenerator {
  def next = scala.util.Random.nextBoolean
}
          </pre>
      	</code>
      </div>
      <p>
        Next we have to implement $RANDOM(a, b)$ using only $RANDOM(0, 1)$ which is <code>BoolUniformGenerator.next</code> in this implementation <span style="font-style:italic">(here we will also use standard lib tools, but the only used standard random generator method is nextBoolean() what actually fits the exercise requirements)</span>
      </p>

      <p> Suppose we have a=1 and b=8 as arguments fed into $RANDOM(a, b)$, the total number of integers in the range is power of two just for convenience.
       And the solution is just to generate a random binary string with length $\log_2(8) = 3$ whose decimal representation plus 1 is the output of the $RANDOM(1, 8)$. If the 0's and 1's coming from $RANDOM(0, 1)$ have equal probability $1/2$ then
      we should expect a random result from 1 to 8 with probability $ p = (1/2)^3 = 1/8$. And it is what we actually need to solve the exercise:
      <div j-scala-decorator> </p>
        <code>
          <pre>
private def generateNumber = {
  // generatedNumber is the output (result)
  var generatedNumber = 0d
  // maxNumber is the second input parameter to the procedure
  if (maxNumber > 1) {
    val i = log2(maxNumber).toInt
    for (currentPow <- 0 until i)
      generatedNumber += (if (BoolUniformGenerator.next) (1 << currentPow) else 0)
    generatedNumber + 1
  }
}

private def log2(i : Int) = math.log(i)/math.log(2)
          </pre>
      	 </code>
      </div>
      <p>
        But this solution works only if the total number of integers to generate equals to power of two. And here is a fix for that: let's generate numbers within a range $[1, 2^{\lceil\ log_2(n) \rceil}]$ while generated integer is not in the input range, where
        "n" is the second argument of the procedure. Then the returned integers will have equal probability and be within the input range.
      </p>
      <div j-scala-decorator>
        <code>
          <pre>
val maxNumber = 1 << math.ceil(log2(n))</p>

var result = Int.MaxValue

//if the result is greater than n then generate again
while (result > n)
    result = generateNumber
          </pre>
      	</code>
      </div>

      <p>
        Then for example for RANDOM(1, 10) we will have $maxNumber = 16$ and currentPow in generateNumber procedure will have values 0, 1, 2, 3; and possible generated numbers from $0000_2$ to $1111_2$. And the result is randomly generated number from 1 to 10
        with equal probability.
      </p>


      <p>
        So what is left is to code generic solution $RANDOM(a, b)$ properly for all arbitrary integer numbers:
      </p>



      <div j-scala-decorator>
        <code>
          <pre>
class UniformGenerator(val lowest : Int, val highest: Int) {
  if (lowest <= Int.MinValue || highest < lowest)
    throw  new IllegalArgumentException("Only numbers which are greater than Int.MinValue allowed and highest must be greater than lowest")

  val count : Long = highest.toLong - lowest.toLong + 1
  private val maxBits  = math.ceil(log2(count)).toInt
  def next = {
    var result = Long.MaxValue
    // generate till the result is within the necessary range
    while (result > highest)
      result = generateNumber
    result toInt
  }

  private def generateNumber = {
    var generatedNumber = 0L
    if (maxBits > 1) {
      for (pow <- 0 until maxBits) {
        generatedNumber += ( if (BoolUniformGenerator.next) (1 << pow) else 0)
      }
    }
    generatedNumber + lowest
  }
  private def log2(i : Long) = math.log(i)/math.log(2)
}
          </pre>
      	</code>
      </div>
      <br/> The expected running time of <code>UniformGenerator.next</code>is $O({\lceil\ log_2(b-a+1) \rceil})$
    </div>`
    },
    {
      header: `Another article`,
      date: "2016-11-11",
      id: 0,
      description: `This is a description of an article`
    },
    {
      header: `Another article`,
      date: "2016-11-11",
      id: -1,
      description: `This is a description of an article`
    }
  ]

  function getArticles() {
    return articles;
  }

  function getRecentArticles() {
    return getArticles().sort((a, b) => Date(b.date) - Date(a.date)).slice(0, 5).map(function(a) {
      return {
        id: a.id,
        header: a.header.substring(0, 70) + "..."
      }
    });
  }

  function getArticle(id) {
    return getArticles().find(a => a.id == id);
  }

  return {
    getArticles: getArticles,
    getRecentArticles: getRecentArticles,
    getArticle: getArticle
  };
})();
